# 0005: Python owns inference

## Status

Accepted — 24 September 2026

## Context

ADR 0001 put a TypeScript model gateway in front of providers and let Python call that gateway over HTTP. ADR 0003 moved agents into `services/api` and said the Next.js apps must not call model providers. The gateway experiment in `services/experiments` then made the remaining question concrete: who speaks the provider wire, and what does `apps/app` see?

Product requests from the signed-in app always need the same checks: auth, validation, stored state, and an approval record before anything leaves the system. A model call made in the browser, or in a Next.js server action, skips that path.

## Decision

`services/api` is the only program that talks to inference, including calls made for evaluations. It calls Vercel AI Gateway from Python. Pydantic AI stays the agent layer inside that service. The gateway is how that service reaches models, including evaluation models such as `typesafe-ai/jev`.

`apps/app` sends product requests to FastAPI and renders the responses. It does not receive model ids, provider URLs, gateway payloads, or provider keys. `apps/marketing` does not call inference at all.

`evals` and any remaining `services/experiments` scripts call FastAPI over HTTP. They never call a model provider or Vercel AI Gateway directly. Provider keys and model selection belong to the API process. Deterministic evaluation code still runs independently. A capability that becomes a product feature moves into `services/api` without creating another inference path.

The initial internal endpoint is `POST /internal/models/evaluate`, supporting typed Jev questions. A shared internal bearer token protects local evaluation access. This endpoint is not a browser-facing product contract. See [API setup](../../services/api/README.md).

## Consequences

- One HTTP contract faces the product UI. Provider differences stay behind FastAPI.
- Provider keys stay in the API process.
- The app can change screens without learning a new model format.
- A gateway or model change is a Python change, then a normal API response.
- The experiment folder is not a second backend.
