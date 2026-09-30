import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from pypdf import PdfReader

GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate"
MODEL = "typesafe-ai/jev"
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def read_pdf_text(path: Path) -> str:
    reader = PdfReader(path)
    pages = [page.extract_text() or "" for page in reader.pages]
    print(pages)
    text = "\n\n".join(pages).strip()
    if not text:
        raise SystemExit(
            "This PDF has no extractable text. A scan needs a different reader."
        )
    return text


def evaluate_pdf(text: str) -> dict:
    api_key = os.environ.get("AI_GATEWAY_API_KEY")
    if not api_key:
        raise SystemExit(
            "AI_GATEWAY_API_KEY is missing. Add it to the repo .env file."
        )

    body = {
        "model": MODEL,
        "state": text,
        "questions": {
            "is_resume": {
                "type": "boolean",
                "instructions": "Is this document a resume or CV?",
                "criteria": {
                    "true": "The text is a person's resume or CV.",
                    "false": "The text is some other kind of document.",
                },
            },
            "document_kind": {
                "type": "choice",
                "instructions": "What kind of document is this?",
                "criteria": {
                    "resume": "a resume or CV",
                    "job_description": "a job posting",
                    "other": "anything else",
                },
            },
            "text_quality": {
                "type": "score",
                "instructions": "How usable is this extracted text?",
                "criteria": ["unreadable", "partial", "usable"],
            },
        },
    }
    request = urllib.request.Request(
        GATEWAY_URL,
        data=json.dumps(body).encode(),
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
        detail = error.read().decode()
        raise SystemExit(f"AI Gateway returned {error.code}: {detail}") from error


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(f"Usage: python {Path(__file__).name} <file.pdf>")

    load_env(ROOT_ENV)
    text = read_pdf_text(Path(sys.argv[1]))
    # print(text)
    result = evaluate_pdf(text)
    print(json.dumps(result["answers"], indent=2))


if __name__ == "__main__":
    main()
