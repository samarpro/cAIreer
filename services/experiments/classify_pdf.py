import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from labels import LABELS
from parse_pdf import ROOT_ENV, load_env
from pdf_lines import PdfLine, extract_lines

GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate"
MODEL = "typesafe-ai/jev"
BATCH_SIZE = 2
MAX_LINE_CHARS = 400


def questions_for(lines: list[PdfLine], offset: int) -> dict:
    questions = {}
    for index, _line in enumerate(lines):
        questions[f"line_{offset + index}"] = {
            "type": "choice",
            "instructions": "Pick the one annotation label for this resume line.",
            "criteria": LABELS,
        }
    return questions


def state_for(lines: list[PdfLine], offset: int) -> str:
    rows = [
        f"line_{offset + index}: {line.text[:MAX_LINE_CHARS]}"
        for index, line in enumerate(lines)
    ]
    return "\n".join(rows)


def evaluate_lines(lines: list[PdfLine]) -> dict:
    api_key = os.environ.get("AI_GATEWAY_API_KEY")
    if not api_key:
        raise SystemExit(
            "AI_GATEWAY_API_KEY is missing. Add it to the repo .env file."
        )

    answers: dict = {}
    for start in range(0, len(lines), BATCH_SIZE):
        batch = lines[start : start + BATCH_SIZE]
        body = {
            "model": MODEL,
            "state": state_for(batch, start),
            "questions": questions_for(batch, start),
        }
        payload = post_json(body, api_key)
        answers.update(payload["answers"])
        time.sleep(0.25)
    return answers


def post_json(body: dict, api_key: str) -> dict:
    data = json.dumps(body).encode()
    delay = 1
    last_error = ""
    for _attempt in range(3):
        request = urllib.request.Request(
            GATEWAY_URL,
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            last_error = error.read().decode()
            if error.code not in {429, 503, 529}:
                raise SystemExit(
                    f"AI Gateway returned {error.code}: {last_error}"
                ) from error
            time.sleep(delay)
            delay *= 2
    raise SystemExit(
        f"AI Gateway stayed unavailable after 3 tries ({len(data)} bytes): {last_error}"
    )


def annotate(lines: list[PdfLine], answers: dict) -> list[dict]:
    spans = []
    for index, line in enumerate(lines):
        answer = answers[f"line_{index}"]
        spans.append(
            {
                "page": line.page,
                "text": line.text,
                "x": line.x,
                "y": line.y,
                "label": answer["choice"],
                "probabilities": answer["probabilities"],
            }
        )
    return spans


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(f"Usage: python {Path(__file__).name} <file.pdf>")

    load_env(ROOT_ENV)
    lines = extract_lines(Path(sys.argv[1]))
    if not lines:
        raise SystemExit(
            "This PDF has no extractable text. A scan needs a different reader."
        )
    spans = annotate(lines, evaluate_lines(lines))
    print(json.dumps({"labels": list(LABELS), "spans": spans}, indent=2))


if __name__ == "__main__":
    main()
