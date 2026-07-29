import {
  generateRequestSchema,
  type GenerateRequest,
  type GenerateResult,
  type ModelCapabilities,
  type ModelInfo,
  type ModelProviderAdapter,
  type ModelTarget,
  type ProviderHealth,
} from "./contracts";
import { ModelGatewayError } from "./errors";

export class ModelGateway {
  private readonly providers = new Map<string, ModelProviderAdapter>();

  constructor(providers: ModelProviderAdapter[]) {
    for (const provider of providers) {
      if (this.providers.has(provider.id)) {
        throw new Error(`Duplicate model provider id: ${provider.id}`);
      }
      this.providers.set(provider.id, provider);
    }
  }

  async health(providerId: string, signal?: AbortSignal): Promise<ProviderHealth> {
    return await this.provider(providerId).health(signal);
  }

  async listModels(providerId: string, signal?: AbortSignal): Promise<ModelInfo[]> {
    return await this.provider(providerId).listModels(signal);
  }

  async getCapabilities(target: ModelTarget): Promise<ModelCapabilities> {
    return await this.provider(target.providerId).getCapabilities(target.model);
  }

  async generate(request: GenerateRequest, signal?: AbortSignal): Promise<GenerateResult> {
    const parsed = generateRequestSchema.parse(request);
    return await this.provider(parsed.target.providerId).generate(parsed, signal);
  }

  private provider(providerId: string): ModelProviderAdapter {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new ModelGatewayError(
        "provider_not_configured",
        `Model provider is not configured: ${providerId}`,
        { providerId },
      );
    }
    return provider;
  }
}
