import {
  providerConfigSchema,
  type ModelCapabilities,
  type ProviderConfig,
} from "./contracts";
import { OpenAICompatibleAdapter } from "./openai-compatible-adapter";

type Fetch = typeof globalThis.fetch;

const commonLocalCapabilities: ModelCapabilities = {
  chat: "supported",
  streaming: "supported",
  tools: "unknown",
  structuredOutput: "unknown",
  vision: "unknown",
  reasoning: "unknown",
  embeddings: "unknown",
};

export function createOllamaAdapter(
  config: Partial<ProviderConfig> & Pick<ProviderConfig, "id">,
  fetchImplementation?: Fetch,
): OpenAICompatibleAdapter {
  const parsed = providerConfigSchema.parse({
    kind: "ollama",
    baseUrl: "http://127.0.0.1:11434/v1",
    ...config,
  });
  return new OpenAICompatibleAdapter(parsed, commonLocalCapabilities, fetchImplementation);
}

export function createLmStudioAdapter(
  config: Partial<ProviderConfig> & Pick<ProviderConfig, "id">,
  fetchImplementation?: Fetch,
): OpenAICompatibleAdapter {
  const parsed = providerConfigSchema.parse({
    kind: "lm-studio",
    baseUrl: "http://127.0.0.1:1234/v1",
    ...config,
  });
  return new OpenAICompatibleAdapter(parsed, commonLocalCapabilities, fetchImplementation);
}

export function createOpenAIAdapter(
  config: Pick<ProviderConfig, "id" | "apiKey"> &
    Partial<Omit<ProviderConfig, "id" | "kind" | "apiKey">>,
  fetchImplementation?: Fetch,
): OpenAICompatibleAdapter {
  const parsed = providerConfigSchema.parse({
    kind: "openai",
    baseUrl: "https://api.openai.com/v1",
    ...config,
  });
  const capabilities: ModelCapabilities = {
    chat: "supported",
    streaming: "supported",
    tools: "unknown",
    structuredOutput: "unknown",
    vision: "unknown",
    reasoning: "unknown",
    embeddings: "unknown",
  };
  return new OpenAICompatibleAdapter(parsed, capabilities, fetchImplementation);
}
