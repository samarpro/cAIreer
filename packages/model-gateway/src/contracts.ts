import { z } from "zod";

export const providerKindSchema = z.enum(["openai", "ollama", "lm-studio"]);
export type ProviderKind = z.infer<typeof providerKindSchema>;

export const providerConfigSchema = z.object({
  id: z.string().min(1),
  kind: providerKindSchema,
  baseUrl: z.url(),
  apiKey: z.string().min(1).optional(),
  timeoutMs: z.number().int().positive().default(30_000),
});
export type ProviderConfig = z.input<typeof providerConfigSchema>;
export type ParsedProviderConfig = z.output<typeof providerConfigSchema>;

export const modelTargetSchema = z.object({
  providerId: z.string().min(1),
  model: z.string().min(1),
});
export type ModelTarget = z.infer<typeof modelTargetSchema>;

export const toolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.string(),
});
export type ToolCall = z.infer<typeof toolCallSchema>;

export const chatMessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("system"), content: z.string() }),
  z.object({ role: z.literal("user"), content: z.string() }),
  z.object({
    role: z.literal("assistant"),
    content: z.string().default(""),
    toolCalls: z.array(toolCallSchema).optional(),
  }),
  z.object({
    role: z.literal("tool"),
    content: z.string(),
    toolCallId: z.string(),
  }),
]);
export type ChatMessage = z.input<typeof chatMessageSchema>;
export type ParsedChatMessage = z.output<typeof chatMessageSchema>;

export const toolDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()),
});
export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

const responseFormatSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text") }),
  z.object({
    type: z.literal("json_schema"),
    name: z.string().min(1),
    schema: z.record(z.string(), z.unknown()),
  }),
]);

export const generateRequestSchema = z.object({
  target: modelTargetSchema,
  messages: z.array(chatMessageSchema).min(1),
  tools: z.array(toolDefinitionSchema).optional(),
  responseFormat: responseFormatSchema.default({ type: "text" }),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().optional(),
});
export type GenerateRequest = z.input<typeof generateRequestSchema>;
export type ParsedGenerateRequest = z.output<typeof generateRequestSchema>;

export const finishReasonSchema = z.enum([
  "stop",
  "length",
  "tool_calls",
  "content_filter",
  "unknown",
]);
export type FinishReason = z.infer<typeof finishReasonSchema>;

export interface GenerateResult {
  message: {
    role: "assistant";
    content: string;
    toolCalls: ToolCall[];
  };
  finishReason: FinishReason;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  provider: {
    id: string;
    kind: ProviderKind;
  };
  model: string;
  latencyMs: number;
}

export type CapabilitySupport = "supported" | "unsupported" | "unknown";

export interface ModelCapabilities {
  chat: CapabilitySupport;
  streaming: CapabilitySupport;
  tools: CapabilitySupport;
  structuredOutput: CapabilitySupport;
  vision: CapabilitySupport;
  reasoning: CapabilitySupport;
  embeddings: CapabilitySupport;
}

export interface ModelInfo {
  id: string;
  providerId: string;
  providerKind: ProviderKind;
  capabilities: ModelCapabilities;
}

export interface ProviderHealth {
  providerId: string;
  providerKind: ProviderKind;
  status: "available" | "unavailable";
  latencyMs: number;
  modelCount?: number;
  errorCode?: string;
}

export interface ModelProviderAdapter {
  readonly id: string;
  readonly kind: ProviderKind;
  health(signal?: AbortSignal): Promise<ProviderHealth>;
  listModels(signal?: AbortSignal): Promise<ModelInfo[]>;
  getCapabilities(model: string): Promise<ModelCapabilities>;
  generate(request: ParsedGenerateRequest, signal?: AbortSignal): Promise<GenerateResult>;
}
