import os
import secrets
from typing import Annotated, Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field, ValidationError

app = FastAPI(title="cAIreer API")
bearer = HTTPBearer(auto_error=False)
GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate"


class BooleanQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["boolean"]
    instructions: str = Field(min_length=1)
    criteria: dict[Literal["true", "false"], str] | None = None


class ChoiceQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["choice"]
    instructions: str = Field(min_length=1)
    criteria: dict[str, str] = Field(min_length=2)


class ScoreQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["score"]
    instructions: str = Field(min_length=1)
    criteria: list[str] = Field(min_length=2)


Question = Annotated[
    BooleanQuestion | ChoiceQuestion | ScoreQuestion, Field(discriminator="type")
]


class EvaluationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: str = Field(min_length=1, max_length=100_000)
    questions: dict[str, Question] = Field(min_length=1, max_length=100)


class EvaluationResponse(BaseModel):
    # Preserve gateway usage, routing, and cost metadata for evaluation reports.
    model_config = ConfigDict(extra="allow")
    answers: dict[str, dict]


def require_internal_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> None:
    expected = os.environ.get("MODEL_GATEWAY_TOKEN")
    if not expected:
        raise HTTPException(503, "Model gateway token is not configured")
    if credentials is None or not secrets.compare_digest(
        credentials.credentials.encode(), expected.encode()
    ):
        raise HTTPException(
            401, "Invalid model gateway token", headers={"WWW-Authenticate": "Bearer"}
        )


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post(
    "/internal/models/evaluate",
    response_model=EvaluationResponse,
    dependencies=[Depends(require_internal_token)],
)
async def evaluate(body: EvaluationRequest) -> EvaluationResponse:
    api_key = os.environ.get("AI_GATEWAY_API_KEY")
    if not api_key:
        raise HTTPException(503, "AI Gateway key is not configured")
    payload = body.model_dump(exclude_none=True)
    payload["model"] = os.environ.get("AI_GATEWAY_EVALUATION_MODEL", "typesafe-ai/jev")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GATEWAY_URL,
                json=payload,
                headers={"Authorization": f"Bearer {api_key}"},
            )
    except httpx.TimeoutException:
        raise HTTPException(504, "AI Gateway timed out") from None
    except httpx.RequestError:
        raise HTTPException(502, "AI Gateway is unavailable") from None

    if response.status_code == 429:
        raise HTTPException(429, "AI Gateway rate limit reached")
    if not response.is_success:
        # Upstream errors can contain submitted resume text or credentials.
        raise HTTPException(502, "AI Gateway rejected the request")
    try:
        result = EvaluationResponse.model_validate(response.json())
        if set(result.answers) != set(body.questions):
            raise ValueError("Gateway answer keys do not match question keys")
        return result
    except (ValueError, ValidationError):
        raise HTTPException(502, "AI Gateway returned an invalid response") from None
