# Resume evaluation

This package measures whether PyMuPDF can support selectable resume regions. PyMuPDF extracts text spans and their bounding boxes for the current eval candidate. It must pass the corpus quality and resource thresholds before product integration.

## Setup

```bash
uv sync --project evals/resume
uv run --project evals/resume pytest
```

Run one or more labelled cases:

```bash
uv run --project evals/resume resume-eval evals/resume/cases/example.json
```

The command prints a report containing quality and local resource measurements. Use `--output evals/resume/results/run.json` to save it. Files below `results/` are ignored because reports may reveal information about private inputs.

## Corpus rules

- Put synthetic or redistributable PDFs in `fixtures/public`.
- Put personal or consented private PDFs in `fixtures/private`. Git ignores them.
- Keep one case JSON per PDF under `cases`.
- Manually review the expected text, order, labels, and boxes.
- Use the structural kinds in `taxonomy.json`; propose a taxonomy change instead of inventing a one-off label in a case.
- Record permission and origin for every public fixture.
- Do not tune a parser against one resume.

## Case format

```json
{
  "case_id": "synthetic-one-column-01",
  "pdf": "../fixtures/public/synthetic-one-column-01.pdf",
  "permission": "synthetic",
  "nodes": [
    {
      "node_id": "name",
      "page_number": 1,
      "kind": "name",
      "text": "Taylor Example",
      "bounding_box": {"x": 54, "y": 72, "width": 160, "height": 18},
      "reading_order": 0,
      "parent_node_id": null,
      "confidence": 1.0
    }
  ]
}
```

Coordinates are points with the origin at the top left of each page, matching PyMuPDF. Each node uses the extracted span's bounding box. Single-character spans remain in the evaluation data but do not receive a box in the annotated PDF.
Colored boxes carry small one-based reading-order numbers. Numbers follow the full parsed node sequence, so a skipped single-character box may leave a gap.
Fragments are grouped by page, then from top to bottom. Fragments whose box tops fall within `LINE_Y_TOLERANCE` of a row's topmost fragment are merged into one node; the current tolerance is 5 points. Their text is joined left to right with spaces, and the merged box encloses every source box. Original fragments, IDs, and font styles are retained under `style.source_fragments` for merged rows. Single-fragment rows keep their original IDs and styles.
This baseline may join separate columns or fields at the same height, insert a space into a word split across spans, or misgroup text with mixed font sizes. It groups visual rows rather than complete paragraphs. A single-character fragment merged into a longer row becomes part of that row's box; standalone single-character rows still receive no box.
Case nodes and parser nodes use Pydantic models; invalid fields (including nested bounding-box values) raise validation errors when loaded.
