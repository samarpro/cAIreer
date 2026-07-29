# ADR 0001: Standard model gateway

**Status:** Accepted

## Context

A2A Hire needs OpenAI, Ollama, and LM Studio without spreading provider-specific request formats, model names, connection settings, and error handling throughout the web application and agent workflows.

Ollama and LM Studio both offer OpenAI-compatible endpoints, but compatibility is partial and feature behaviour can differ by runtime, endpoint, version, and loaded model. Compatibility reduces adapter work; it does not remove the need for an application-owned boundary.

## Decision

Create `packages/model-gateway` at the beginning of the project.

All TypeScript code accesses models through one internal contract for health checks, model discovery, capabilities, generation, streaming, tool calls, structured output, embeddings, and normalised errors.

Use an OpenAI-compatible transport for shared wire behaviour and provider adapters for runtime-specific differences. Integrate the gateway with the OpenAI Agents SDK through its `ModelProvider` interface.

A2A Hire owns conversation history. Do not depend on provider-side response or conversation state for portable workflows.

Python automation does not talk to model providers directly. If a Python use case later requires inference, add a versioned internal HTTP surface over the gateway.

## Consequences

### Benefits

- Features depend on one stable model contract.
- Local and cloud providers can be selected through configuration.
- Tests can use a fake adapter without running a real model.
- Capability mismatches fail explicitly instead of creating mysterious behaviour.
- Provider, model, latency, and usage metadata have one observability shape.

### Costs

- We own an abstraction and its contract tests.
- Provider-specific features require an explicit capability and adapter path.
- The common contract must not become a lowest-common-denominator dumping ground.

## Invariants

- Feature code never constructs provider HTTP requests directly.
- Provider choice is trusted server-side configuration, never arbitrary browser input.
- Model output is untrusted and validated at the gateway consumer boundary.
- Consequential work never silently changes provider or model.
- A feature declares required capabilities and fails early when they are absent.

## Initial contract sketch

```ts
type ModelPurpose =
  | "job-match"
  | "application-draft"
  | "outreach-draft"
  | "embedding";

interface ModelGateway {
  health(provider: ProviderId): Promise<ProviderHealth>;
  listModels(provider: ProviderId): Promise<ModelInfo[]>;
  getCapabilities(target: ModelTarget): Promise<ModelCapabilities>;
  generate(request: GenerateRequest): Promise<GenerateResult>;
  stream(request: GenerateRequest): AsyncIterable<ModelStreamEvent>;
  embed(request: EmbedRequest): Promise<EmbedResult>;
}
```

The precise schemas will be written with Zod and tested before implementation. This sketch records responsibility, not a frozen API.
