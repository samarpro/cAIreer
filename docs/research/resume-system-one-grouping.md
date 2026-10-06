# Resume grouping with a System One model

Research date: 2026-10-06. Status: proposal for the resume evals, not an implemented grouping pipeline or a measured capability on our resumes.

Implementation follow-up: the evals now have an optional sequential boundary loop
with pending candidates, FIFO context, saved membership, and request-size estimation.
Native PyMuPDF line IDs prepare its inputs. Block classification and labelled model
accuracy evals remain proposed. See [eval usage](../../evals/resume/README.md).

## What the documentation supports

TypeSafe's structure-recovery cookbook uses two model passes. The first asks whether adjacent lines continue a sentence. Code combines lines using the answers. The second classifies the resulting blocks. Explicit formatting cues stay in code. The example uses a plain-text memo, not a PDF resume. Its warning about wording matters here: asking whether lines share a paragraph merged separate list items, while asking about sentence continuation kept those items separate. Resume grouping must also support bullets containing several sentences, so sentence continuation alone is insufficient. [Structure recovery](https://docs.typesafe.ai/cookbooks/autoformat)

Jev accepts text and structured JSON state, not images, audio, or video. We would send extracted text and named layout facts, rather than a rendered PDF page. Questions sharing a request see the same state but are evaluated independently. [State](https://docs.typesafe.ai/concepts/state)

A Choice question selects among supplied options and returns the selected option, probabilities, and confidence. We can define boundary options and block categories ourselves. They are application-specific choices, not built-in PDF functions. Question IDs are not visible to the model, so instructions must identify the relevant lines in the state. [Choice](https://docs.typesafe.ai/primitives/choice)

TypeSafe documents weaknesses in numeric precision, irrelevant context, indirection, and option-order sensitivity for Jev 1.13. Keep coordinate arithmetic in code, supply local context, and evaluate the wording and option order. Confidence is an output to assess, not proof that a selection is correct. [Jev 1.13 limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13)

## Proposed eval pipeline

The checked-in `evals/resume/src/resume_eval/parser.py` currently returns individual spans in extraction order. It does not contain the row-merging behavior described earlier in the conversation. Preparing geometric lines is therefore a proposed step for this checkout.

1. Preserve every original span's ID, text, page, font, and box. Code prepares candidate lines using vertical tolerance plus horizontal gaps or column boundaries. Matching y alone must not combine unrelated columns.
2. For nearby lines within the same column, ask a boundary Choice: `continue` means the next line belongs to this same bullet or paragraph; `new_block` means a separate heading, bullet, paragraph, or field; `uncertain` means available evidence does not establish a boundary. Include the two target lines, neighboring text, the current heading, and code-computed facts such as aligned indentation or a bullet marker.
3. Code applies accepted boundaries in order. Treat uncertain answers or insufficient confidence as a reason to keep the smaller groups. Thresholds need labelled eval results. Explicit new bullets and column barriers take precedence. Independent pair decisions can otherwise chain into an oversized block.
4. Ask a second Choice for each assembled block, such as `heading`, `bullet`, `paragraph`, `contact`, `job_header`, `education`, `skills`, or `other`. A content category describes a block; it does not establish that all items in that category belong to one selection. Higher-level experience-entry grouping can be evaluated separately.
5. Store groups as references to source IDs. Code computes their geometry from the original boxes. Keep individual boxes for hover highlighting across wrapped lines rather than filling all whitespace inside one enclosing rectangle. Validate membership, duplicate assignment, missing sources, column crossings, and allowed labels in code. The model never rewrites resume text or invents coordinates.

Compute and cache the groups when the PDF is loaded or changes. Hover and click use those saved groups. Cache by document content, parser configuration, questions, and model version; invalidate after edits.

## Architecture and evaluation

`TECH-MAP.md` requires model-based evals to call the internal FastAPI evaluation endpoint. Provider calls stay in `services/api`. This proposal does not select a new provider connection or add infrastructure.

Label expected bullets, paragraphs, and headings using source-span membership. Compare a deterministic geometry baseline against geometry plus Jev. Measure incorrect merges, unnecessary splits, group membership accuracy, and whether a clicked span selects exactly the intended content. Include wrapped bullets, several sentences per bullet, title/date rows, columns, and mixed fonts. Track unknown outcomes, latency, and cost separately. The cookbook establishes a useful design pattern; it does not establish accuracy or performance for our PDF selection workflow.
