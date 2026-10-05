# Model gateway

FastAPI is the only process that calls model providers. Model-based evaluations use its internal HTTP endpoint. Deterministic parsing does not need the API.

The first endpoint is `POST /internal/models/evaluate`, supporting Jev boolean, choice, and score questions. It uses Vercel's [evaluation HTTP API](https://vercel.com/docs/ai-gateway/modalities/evaluation). Text generation, streaming, agents, and additional providers can be added when a caller needs them.

## Run locally

From the repository root:

```bash
cp services/api/.env.example services/api/.env
# Edit services/api/.env with your Vercel key and a random internal token.
uv run --project services/api uvicorn src.main:app \
  --app-dir services/api --host 127.0.0.1 --port 8000 \
  --env-file services/api/.env
```

Only the API needs `AI_GATEWAY_API_KEY`. It selects the model through `AI_GATEWAY_EVALUATION_MODEL`, defaulting to `typesafe-ai/jev`. Requests cannot override the model or upstream URL. Keep the internal token out of browser code; this endpoint is for trusted server-side callers and local evaluations.

In a separate terminal, export the same internal token and run an evaluation:

```bash
export MODEL_GATEWAY_TOKEN='your-internal-token'
python3 evals/model_gateway.py <<'JSON'
{
  "state": "Synthetic resume: Alex Example, software engineer",
  "questions": {
    "is_resume": {
      "type": "boolean",
      "instructions": "Is this text a resume?"
    }
  }
}
JSON
```

Python evaluation code can also import `evaluate` from `evals.model_gateway` when run from the repository root. Set `MODEL_GATEWAY_API_URL` to change the API address; the default is `http://127.0.0.1:8000`.

The response preserves `answers` and any gateway model, usage, routing, and cost metadata. Callers must validate answer semantics against their evaluation contract. Measure HTTP elapsed time separately from any provider timing available in the response.

The existing `services/experiments/parse_pdf.py` and `classify_pdf.py` callers also use this endpoint. They now need the exported internal token and a running API, and no longer load the repository's provider secrets.

## Failures and checks

The endpoint returns 401 for a missing or incorrect internal token, 422 for invalid input, 503 for missing server configuration, 429 for an upstream rate limit, 504 for a timeout, and 502 for other upstream failures or malformed responses. It does not relay upstream error bodies or retry model calls automatically. `/health` remains available without model configuration.

Run the isolated API contract tests from the repository root:

```bash
uv run --project services/api pytest -c services/api/pyproject.toml services/api/tests
```

Tests mock the gateway and do not spend provider credits. This slice is for local evaluation, with a shared internal token rather than product identity, deployment controls, or durable usage accounting.
