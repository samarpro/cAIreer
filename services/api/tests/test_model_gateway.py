import json

import httpx
import main
import pytest
from fastapi.testclient import TestClient

BODY = {
    "state": "Synthetic resume text",
    "questions": {
        "is_resume": {"type": "boolean", "instructions": "Is this a resume?"}
    },
}
HEADERS = {"Authorization": "Bearer internal-test-token"}
RESULT = {
    "model": "typesafe-ai/jev",
    "answers": {"is_resume": {"type": "boolean", "probability": 0.99}},
    "usage": {"inputTokens": 12, "outputTokens": 3},
    "providerMetadata": {"gateway": {"cost": "0.00001"}},
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("MODEL_GATEWAY_TOKEN", "internal-test-token")
    monkeypatch.setenv("AI_GATEWAY_API_KEY", "provider-test-secret")
    monkeypatch.setenv("AI_GATEWAY_EVALUATION_MODEL", "typesafe-ai/jev")
    return TestClient(main.app)


def mock_gateway(monkeypatch, handler):
    original_client = httpx.AsyncClient
    monkeypatch.setattr(
        main.httpx,
        "AsyncClient",
        lambda **kwargs: original_client(
            transport=httpx.MockTransport(handler), **kwargs
        ),
    )


def test_routes_to_fixed_gateway_with_server_model_and_preserves_usage(
    client, monkeypatch
):
    def handler(request):
        assert str(request.url) == "https://ai-gateway.vercel.sh/v1/evaluate"
        assert request.headers["Authorization"] == "Bearer provider-test-secret"
        assert request.extensions["timeout"]["read"] == 60.0
        assert json.loads(request.content) == {**BODY, "model": "typesafe-ai/jev"}
        return httpx.Response(200, json=RESULT)

    mock_gateway(monkeypatch, handler)
    response = client.post("/internal/models/evaluate", json=BODY, headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == RESULT


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer wrong"}])
def test_requires_internal_token_without_calling_gateway(client, monkeypatch, headers):
    mock_gateway(
        monkeypatch, lambda _: pytest.fail("Unauthorized request reached gateway")
    )
    assert (
        client.post("/internal/models/evaluate", json=BODY, headers=headers).status_code
        == 401
    )


@pytest.mark.parametrize("variable", ["AI_GATEWAY_API_KEY", "MODEL_GATEWAY_TOKEN"])
def test_missing_configuration_leaves_health_available(client, monkeypatch, variable):
    monkeypatch.delenv(variable)
    mock_gateway(
        monkeypatch, lambda _: pytest.fail("Unconfigured request reached gateway")
    )
    assert client.get("/health").json() == {"ok": True}
    assert (
        client.post("/internal/models/evaluate", json=BODY, headers=HEADERS).status_code
        == 503
    )


@pytest.mark.parametrize(
    "body",
    [
        {**BODY, "model": "unapproved/model"},
        {**BODY, "url": "http://untrusted-provider"},
        {**BODY, "state": ""},
        {**BODY, "questions": {}},
        {**BODY, "questions": {"invalid": {"type": "choice", "instructions": "Pick"}}},
    ],
)
def test_rejects_invalid_input_before_model_call(client, monkeypatch, body):
    mock_gateway(monkeypatch, lambda _: pytest.fail("Invalid request reached gateway"))
    assert (
        client.post("/internal/models/evaluate", json=body, headers=HEADERS).status_code
        == 422
    )


@pytest.mark.parametrize(
    "upstream_status, expected", [(401, 502), (500, 502), (429, 429)]
)
def test_does_not_expose_upstream_errors(
    client, monkeypatch, upstream_status, expected
):
    mock_gateway(
        monkeypatch,
        lambda _: httpx.Response(
            upstream_status, text="private resume and provider-test-secret"
        ),
    )
    response = client.post("/internal/models/evaluate", json=BODY, headers=HEADERS)
    assert response.status_code == expected
    assert "private resume" not in response.text
    assert "provider-test-secret" not in response.text


@pytest.mark.parametrize(
    "error, expected", [(httpx.ReadTimeout, 504), (httpx.ConnectError, 502)]
)
def test_network_failures(client, monkeypatch, error, expected):
    def handler(request):
        raise error("sensitive upstream detail", request=request)

    mock_gateway(monkeypatch, handler)
    response = client.post("/internal/models/evaluate", json=BODY, headers=HEADERS)
    assert response.status_code == expected
    assert "sensitive" not in response.text


@pytest.mark.parametrize("payload", [{}, {"answers": {}}, {"answers": "invalid"}])
def test_rejects_malformed_gateway_results(client, monkeypatch, payload):
    mock_gateway(monkeypatch, lambda _: httpx.Response(200, json=payload))
    assert (
        client.post("/internal/models/evaluate", json=BODY, headers=HEADERS).status_code
        == 502
    )
