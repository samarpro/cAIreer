import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from pypdf import PdfReader


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
    body = {
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
    return post_json(body)


def post_json(body: dict) -> dict:
    token = os.environ.get("MODEL_GATEWAY_TOKEN")
    if not token:
        raise SystemExit(
            "MODEL_GATEWAY_TOKEN is missing. Use the API's internal token."
        )
    api_url = os.environ.get("MODEL_GATEWAY_API_URL", "http://127.0.0.1:8000")
    request = urllib.request.Request(
        f"{api_url.rstrip('/')}/internal/models/evaluate",
        data=json.dumps(body).encode(),
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
        raise SystemExit(f"Model API returned {error.code}") from error
    except urllib.error.URLError as error:
        raise SystemExit(
            "Model API is unavailable. Start services/api first."
        ) from error


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(f"Usage: python {Path(__file__).name} <file.pdf>")

    text = read_pdf_text(Path(sys.argv[1]))
    # print(text)
    result = evaluate_pdf(text)
    print(json.dumps(result["answers"], indent=2))


if __name__ == "__main__":
    main()
