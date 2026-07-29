import { describe, expect, it, vi } from "vitest";

import { ModelGateway } from "./gateway";
import { ModelGatewayError } from "./errors";
import { createLmStudioAdapter, createOllamaAdapter } from "./providers";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ModelGateway", () => {
  it.each([
    ["ollama-local", createOllamaAdapter],
    ["lm-studio-local", createLmStudioAdapter],
  ] as const)("normalises model discovery for %s", async (providerId, createAdapter) => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse({ data: [{ id: "local-model" }] }),
    );
    const gateway = new ModelGateway([
      createAdapter({ id: providerId }, fetch),
    ]);

    const models = await gateway.listModels(providerId);

    expect(models).toEqual([
      expect.objectContaining({ id: "local-model", providerId }),
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/models$/),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("normalises a chat-completion response", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse({
        model: "qwen",
        choices: [
          {
            finish_reason: "stop",
            message: { content: '{"fit":true}' },
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
      }),
    );
    const gateway = new ModelGateway([
      createOllamaAdapter({ id: "local" }, fetch),
    ]);

    const result = await gateway.generate({
      target: { providerId: "local", model: "qwen" },
      messages: [{ role: "user", content: "Assess this job" }],
      responseFormat: {
        type: "json_schema",
        name: "job_fit",
        schema: { type: "object", properties: { fit: { type: "boolean" } } },
      },
    });

    expect(result).toMatchObject({
      message: { content: '{"fit":true}', toolCalls: [] },
      finishReason: "stop",
      provider: { id: "local", kind: "ollama" },
      usage: { totalTokens: 14 },
    });
    const [, request] = fetch.mock.calls[0] ?? [];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      model: "qwen",
      response_format: {
        type: "json_schema",
        json_schema: { name: "job_fit", strict: true },
      },
      stream: false,
    });
  });

  it("returns a stable error for an unknown provider", async () => {
    const gateway = new ModelGateway([]);

    await expect(
      gateway.generate({
        target: { providerId: "missing", model: "anything" },
        messages: [{ role: "user", content: "Hello" }],
      }),
    ).rejects.toMatchObject({
      code: "provider_not_configured",
      providerId: "missing",
    } satisfies Partial<ModelGatewayError>);
  });

  it("reports an unreachable provider without throwing from health", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockRejectedValue(new Error("connection refused"));
    const gateway = new ModelGateway([
      createLmStudioAdapter({ id: "local" }, fetch),
    ]);

    await expect(gateway.health("local")).resolves.toMatchObject({
      status: "unavailable",
      errorCode: "provider_unavailable",
    });
  });
});
