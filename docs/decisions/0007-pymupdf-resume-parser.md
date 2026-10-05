# 0007: Select PyMuPDF for resume parsing

## Status

Accepted, 30 September 2026

Updated after the eval migration: the `pypdf` comparison baseline was removed from `evals/resume` at the owner's request.

## Context

cAIreer needs resume nodes with text, reading order, page geometry, and enough structure to support selectable regions. The earlier `pypdf` baseline estimated text widths from character count and font size, and its visitor-based extraction required manual coordinate handling.

PyMuPDF exposes text as blocks, lines, and spans with bounding boxes and style details. Its positional data is a closer fit for the resume node contract and should reduce custom geometry reconstruction. Reading order still depends on layout, so multi-column cases require evaluation.

## Decision

Use PyMuPDF as cAIreer's selected resume parser in `evals/resume`. PyMuPDF must meet the written quality and resource thresholds before it moves into product services.

## Consequences

- PyMuPDF is the chosen parser for the resume evaluation and subsequent product parsing if it passes the evaluation gate.
- The eval package uses PyMuPDF for both span extraction and visual annotations.
- Evaluation still determines whether PyMuPDF meets requirements for text recovery, reading order, geometry, structure, latency, and memory.
- Before product integration, review PyMuPDF's AGPL or commercial licensing terms for the intended deployment.
- If PyMuPDF misses a written threshold, revisit this decision using the recorded evaluation results.
