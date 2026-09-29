from __future__ import annotations

import json
import platform
import resource
import subprocess
import time
import tracemalloc
from pathlib import Path
from typing import Any

from resume_eval.baseline import parse_pdf
from resume_eval.metrics import evaluate_nodes
from resume_eval.schema import ResumeNode


def git_revision(repo: Path) -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=repo,
        check=False,
        capture_output=True,
        text=True,
    )
    return completed.stdout.strip() or "unknown"


def max_rss_bytes() -> int:
    value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return int(value if platform.system() == "Darwin" else value * 1024)


def evaluate_case(case_path: Path, repo: Path) -> dict[str, Any]:
    case = json.loads(case_path.read_text())
    expected = [ResumeNode.model_validate(value) for value in case["nodes"]]
    pdf_path = (case_path.parent / case["pdf"]).resolve()

    tracemalloc.start()
    wall_start = time.perf_counter()
    cpu_start = time.process_time()
    actual = parse_pdf(pdf_path)
    cpu_seconds = time.process_time() - cpu_start
    wall_seconds = time.perf_counter() - wall_start
    _, peak_python_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return {
        "case_id": case["case_id"],
        "permission": case["permission"],
        "candidate": "pypdf-estimated-lines",
        "code_revision": git_revision(repo),
        "runtime": {
            "python": platform.python_version(),
            "system": platform.system(),
            "machine": platform.machine(),
        },
        "quality": evaluate_nodes(expected, actual),
        "resources": {
            "wall_seconds": wall_seconds,
            "cpu_seconds": cpu_seconds,
            "peak_python_alloc_bytes": peak_python_bytes,
            "process_max_rss_bytes": max_rss_bytes(),
        },
        "hosted_usage": {
            "model": None,
            "input_tokens": None,
            "output_tokens": None,
            "cost_usd": None,
        },
        "counts": {
            "expected_nodes": len(expected),
            "actual_nodes": len(actual),
        },
        # "expected": [node.model_dump() for node in expected],
        "actual": [node.model_dump() for node in actual],
    }
