from __future__ import annotations

import argparse
import json
from pathlib import Path
from resume_eval.runner import evaluate_case
import time


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Evaluate a resume parser candidate.")
    command.add_argument("cases", nargs="+", type=Path)
    command.add_argument("--output", type=Path,)
    return command


def main() -> None:
    args = parser().parse_args()
    repo = Path(__file__).resolve().parents[4]
    report = {
        "suite": "resume-spatial-parsing",
        "runs": [evaluate_case(case.resolve(), repo) for case in args.cases],
    }
    rendered = json.dumps(report, indent=2)
    if args.output is None:
        print(rendered)
        return
    output_path = Path(__file__).resolve().parents[2]
    file_name = f"report-{int(time.time())}.json"
    path = output_path / "results" /file_name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(rendered + "\n")
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
