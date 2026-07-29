import { z } from "zod";

import {
  finishReasonSchema,
  type GenerateResult,
  type ModelCapabilities,
  type ModelInfo,
  type ModelProviderAdapter,
  type ParsedGenerateRequest,
  type ParsedProviderConfig,
  type ProviderHealth,
  providerConfigSchema,
} from "./contracts";
import { ModelGatewayError, type ModelGatewayErrorCode } from "./errors";

const modelsResponseSchema = z.object({
  data: z.array(z.object({ id: z.string() })),
});

const completionResponseSchema = z.object({
  model: z.string().optional(),
  choices: z.array(
    z.object({
      finish_reason: z.string().nullable().optional(),
      message: z.object({
        content: z.string().nullable().optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            }),
          )
          .optional(),
      }),
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
});

type Fetch = typeof globalThis.fetch;

export class OpenAICompatibleAdapter implements ModelProviderAdapter {
  readonly id: string;
  readonly kind: ParsedProviderConfig["kind"];

  private readonly config: ParsedProviderConfig;
  private readonly fetch: Fetch;
  private readonly capabilities: ModelCapabilities;

  constructor(
    config: ParsedProviderConfig,
    capabilities: ModelCapabilities,
    fetchImplementation: Fetch = globalThis.fetch,
  ) {
    this.config = providerConfigSchema.parse(config);
    this.id = this.config.id;
    this.kind = this.config.kind;
    this.capabilities = capabilities;
    this.fetch = fetchImplementation;
  }

  async health(signal?: AbortSignal): Promise<ProviderHealth> {
    const startedAt = performance.now();

    try {
      const models = await this.listModels(signal);
      return {
        providerId: this.id,
        providerKind: this.kind,
        status: "available",
        latencyMs: Math.round(performance.now() - startedAt),
        modelCount: models.length,
      };
    } catch (error) {
      const gatewayError = this.asGatewayError(error);
      return {
        providerId: this.id,
        providerKind: this.kind,
        status: "unavailable",
        latencyMs: Math.round(performance.now() - startedAt),
        errorCode: gatewayError.code,
      };
    }
  }

  async listModels(signal?: AbortSignal): Promise<ModelInfo[]> {
    const response = await this.request("/models", { method: "GET", signal });
    const body = this.parseResponse(modelsResponseSchema, await response.json());

    return body.data.map(({ id }) => ({
      id,
      providerId: this.id,
      providerKind: this.kind,
      capabilities: { ...this.capabilities },
    }));
  }

  async getCapabilities(_model: string): Promise<ModelCapabilities> {
    return { ...this.capabilities };
  }

  async generate(
    request: ParsedGenerateRequest,
    signal?: AbortSignal,
  ): Promise<GenerateResult> {
    const startedAt = performance.now();
    const body = {
      model: request.target.model,
      messages: request.messages.map((message) => {
        if (message.role === "assistant") {
          return {
            role: message.role,
            content: message.content,
            tool_calls: message.toolCalls?.map((call) => ({
              id: call.id,
              type: "function",
              function: { name: call.name, arguments: call.arguments },
            })),
          };
        }

        if (message.role === "tool") {
          return {
            role: message.role,
            content: message.content,
            tool_call_id: message.toolCallId,
          };
        }

        return message;
      }),
      tools: request.tools?.map((tool) => ({
        type: "function",
        function: tool,
      })),
      response_format:
        request.responseFormat.type === "json_schema"
          ? {
              type: "json_schema",
              json_schema: {
                name: request.responseFormat.name,
                strict: true,
                schema: request.responseFormat.schema,
              },
            }
          : undefined,
      temperature: request.temperature,
      max_tokens: request.maxOutputTokens,
      stream: false,
    };

    const response = await this.request("/chat/completions", {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
    const completion = this.parseResponse(
      completionResponseSchema,
      await response.json(),
    );
    const choice = completion.choices[0];

    if (!choice) {
      throw new ModelGatewayError("invalid_response", "Provider returned no choices", {
        providerId: this.id,
      });
    }

    const rawFinishReason = choice.finish_reason ?? "unknown";
    const finishReason = finishReasonSchema.safeParse(rawFinishReason);

    return {
      message: {
        role: "assistant",
        content: choice.message.content ?? "",
        toolCalls:
          choice.message.tool_calls?.map((call) => ({
            id: call.id,
            name: call.function.name,
            arguments: call.function.arguments,
          })) ?? [],
      },
      finishReason: finishReason.success ? finishReason.data : "unknown",
      usage: {
        inputTokens: completion.usage?.prompt_tokens,
        outputTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
      provider: { id: this.id, kind: this.kind },
      model: completion.model ?? request.target.model,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const timeoutSignal = AbortSignal.timeout(this.config.timeoutMs);

    try {
      const response = await this.fetch(`${this.normalisedBaseUrl()}${path}`, {
        ...init,
        signal: init.signal ?? timeoutSignal,
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
          ...init.headers,
        },
      });

      if (!response.ok) {
        throw this.httpError(response.status);
      }

      return response;
    } catch (error) {
      throw this.asGatewayError(error);
    }
  }

  private normalisedBaseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, "");
  }

  private parseResponse<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new ModelGatewayError(
        "invalid_response",
        "Provider returned a response that does not match the gateway contract",
        { providerId: this.id, cause: result.error },
      );
    }
    return result.data;
  }

  private httpError(status: number): ModelGatewayError {
    let code: ModelGatewayErrorCode = "generation_failed";
    if (status === 401 || status === 403) code = "authentication_failed";
    if (status === 404) code = "model_not_found";
    if (status === 429) code = "rate_limited";
    if (status === 400) code = "invalid_request";

    return new ModelGatewayError(code, `Provider request failed with status ${status}`, {
      providerId: this.id,
      status,
    });
  }

  private asGatewayError(error: unknown): ModelGatewayError {
    if (error instanceof ModelGatewayError) return error;
    return new ModelGatewayError("provider_unavailable", "Model provider is unavailable", {
      providerId: this.id,
      cause: error,
    });
  }
}
