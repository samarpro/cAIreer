"""HTTP-only model evaluation client. Run with a JSON request on stdin."""

import json
import os
import sys
import urllib.error
import urllib.request


def evaluate(state: str, questions: dict) -> dict:
    token = os.environ.get("MODEL_GATEWAY_TOKEN")
    if not token:
        raise RuntimeError("MODEL_GATEWAY_TOKEN is required")
    api_url = os.environ.get("MODEL_GATEWAY_API_URL", "http://127.0.0.1:8000")
    request = urllib.request.Request(
        f"{api_url.rstrip('/')}/internal/models/evaluate",
        data=json.dumps({"state": state, "questions": questions}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=65) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Model API returned HTTP {error.code}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(
            "Model API is unavailable. Start services/api first."
        ) from error


if __name__ == "__main__":
    body = json.load(sys.stdin)
    try:
        print(json.dumps(evaluate(body["state"], body["questions"]), indent=2))
    except RuntimeError as error:
        raise SystemExit(str(error)) from error
