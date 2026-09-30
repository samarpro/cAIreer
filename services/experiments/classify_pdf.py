import json
import sys
import time
from pathlib import Path

from labels import LABELS
from parse_pdf import post_json
from pdf_lines import PdfLine, extract_lines

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
    answers: dict = {}
    for start in range(0, len(lines), BATCH_SIZE):
        batch = lines[start : start + BATCH_SIZE]
        body = {
            "state": state_for(batch, start),
            "questions": questions_for(batch, start),
        }
        payload = post_json(body)
        answers.update(payload["answers"])
        time.sleep(0.25)
    return answers


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

    lines = extract_lines(Path(sys.argv[1]))
    if not lines:
        raise SystemExit(
            "This PDF has no extractable text. A scan needs a different reader."
        )
    spans = annotate(lines, evaluate_lines(lines))
    print(json.dumps({"labels": list(LABELS), "spans": spans}, indent=2))


if __name__ == "__main__":
    main()
