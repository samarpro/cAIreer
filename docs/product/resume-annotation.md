# Resume annotation contract

## User outcome

A user can upload a resume, select a visible element, ask for a focused change in a compact chat, preview the result, and accept or reject it.

## Interaction

1. The system renders the uploaded resume.
2. The system groups extracted text into meaningful selectable regions before the user interacts with the page.
3. Hovering over text or nearby whitespace previews the region a click would select. Keyboard focus gives the same preview. Whitespace far from text selects nothing.
4. Clicking locks that region in focus, leaves ordinary PDF editing available, and opens a compact chat anchored near the selection.
5. The chat receives the selected region, its child spans, local section, and the user's request.
6. The system proposes a patch. It does not directly mutate the accepted document. Direct edits and AI proposals both produce a previewable revision.
7. The user sees the text and visual differences.
8. Accepting creates a new revision. Rejecting leaves the document unchanged.

## Region grouping to evaluate

- Keep PyMuPDF spans and geometry as the extraction layer. Combine spans into lines, then candidate bullets, paragraphs, headings, and experience entries using spacing, alignment, bullets, typography, and section boundaries.
- Use the union of child text boxes as the hover highlight. Keep separate boxes for separate lines so whitespace across columns is not highlighted as content.
- Keep a region's child span IDs and text. A region may cross several editor text objects, so selection and editing need an explicit mapping rather than assuming one PDF object per region.
- Compare deterministic grouping with a hybrid that asks Jev bounded questions about ambiguous neighboring lines or region labels. Precompute and cache those decisions. Hover and keyboard focus must never wait for a model call.
- If grouping is uncertain, offer a smaller region and let the user expand or reduce the selection before editing.

## PDF editor evaluation

Evaluate an existing web PDF editor before choosing one. The trial must show direct editing of existing text, programmatic editing of a selected region, custom hover overlays and chat, export of a revised PDF, and a visual diff on the same resume corpus. Compare licensing, deployment needs, privacy, and whether changes preserve unrelated content. A viewer that only adds annotations does not satisfy direct text editing.

Current candidates: [Nutrient Web SDK](https://www.nutrient.io/guides/web/editor/content-editor-api/) exposes PDF text blocks and programmatic content editing, but requires its licensed Content Editor and Document Engine; [Apryse WebViewer](https://docs.apryse.com/web/samples/webviewer-custom-ui) offers direct content editing and custom React UI. [PDF.js](https://mozilla.github.io/pdf.js/getting_started/) is a useful open viewer candidate if the edit/export path is handled separately. No editor has been selected.

## Invariants

- The original upload is immutable.
- Every selectable region has a stable node ID.
- A patch names every node it intends to change.
- Nodes outside the patch remain byte-for-byte or structurally unchanged, according to the chosen document representation.
- The user can inspect the full diff before accepting.
- Parser or model uncertainty is visible when it affects selection or editing.
- Hover and keyboard focus preview the same region; the chat cannot obscure the focused content.
- Private resume content is not written to routine logs or committed evaluation results.

## First supported scope

- Text-based PDF resumes
- One or two pages
- Selection at line or block level
- Text replacement within a selected block
- A regenerated preview

Scanned resumes, arbitrary graphics editing, and exact mutation of every PDF drawing command remain outside the first slice until evaluated.
