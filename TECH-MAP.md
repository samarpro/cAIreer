# cAIreer technology map

This is the shared technical reference for cAIreer. Read it before making architecture, dependency, service-boundary, or deployment decisions. Keep it aligned with the repository.

## Current stage

cAIreer is in capability evaluation, not product integration.

The first capability under evaluation is spatial resume parsing. A useful result must preserve enough text, reading order, structure, and page geometry for a user to select a visible resume region and request a focused change.

Browser use follows resume evaluation. Candidate approaches will be compared on the same navigation and extraction tasks before a framework or model becomes part of the product.

`apps/app` and `services/api` remain thin shells until a capability has a written evaluation contract and meets its acceptance thresholds. The marketing site continues independently.

## Repository map

```text
apps/
  marketing/        public website
  app/              product shell, no experimental capability code
evals/
  resume/           resume fixtures, parser baselines, scoring, and run reports
  browser/          browser task contract, fixtures, and later model comparisons
services/
  api/              product API shell; receives capabilities only after evaluation
packages/
  ui/               shared React components
  eslint-config/    shared lint rules
  typescript-config/shared TypeScript settings
docs/
  decisions/        architecture decision records
  product/          product behavior and interaction contracts
```

The rule is simple: uncertain work begins in `evals`. Proven product behavior moves into `services/api` or `apps/app`.

## System boundaries

### `apps/marketing`

Owns the public product story, waitlist, and research invitations. It must not depend on the product API or evaluation code.

### `apps/app`

Will own the signed-in product interface. During evaluation it stays a shell. Thin internal viewers may be added only when they are needed to inspect resume regions or browser traces. Those viewers are test instruments, not finished product screens.

### `evals/resume`

Owns:

- consented, synthetic, or public resume fixtures;
- manually reviewed expected annotations;
- parser adapters and model experiments;
- quality scores;
- latency, hosted cost, CPU, and memory measurements;
- saved run reports that do not contain private resume content.

Private resumes belong in ignored `fixtures/private` directories. Do not commit personal resumes by default.

### `evals/browser`

Will own repeatable job-site navigation and extraction tasks. It will compare deterministic DOM or accessibility-tree logic, small local models, hosted models, and visual fallbacks.

Navigation and job extraction may share page perception. Their permissions differ. Extraction is read-only. Submit, send, and post remain consequential actions that require explicit human approval when product integration begins.

### `services/api`

Will own authenticated product operations, durable state, model calls, and approval enforcement. It is currently a health-check shell. Evaluation scripts may call model providers directly through trusted server-side configuration, but browser code and Next.js code may not.

## Resume document contract

A parser candidate should return stable document nodes with these fields:

```text
node_id
page_number
kind
text
bounding_box: x, y, width, height
reading_order
style
parent_node_id
confidence
```

The original PDF stays immutable. A user edit targets one or more stable node IDs and creates a revision. The system must show a visual diff before accepting the revision. A focused edit must not silently rewrite unrelated nodes.

The current resume eval uses PyMuPDF coordinates: points measured from the top left of each page. Its visual annotation PDF is a separate output in `evals/resume/results`.

The current parser merges spans whose box tops are within 5 points of a row's topmost span, joining text left to right and retaining source fragments and font styles in the merged node. This row heuristic can combine separate columns or fields at the same height and remains under evaluation.

Pixel-perfect editing of arbitrary PDF internals is not assumed. The evaluation will determine whether the product preserves the uploaded design, regenerates an editable document, or supports both with stated limits.

The intended interaction is to preview a meaningful region on hover or keyboard focus, select it on click, then allow direct PDF editing alongside a compact AI chat. Region grouping is evaluated before interaction so hover stays immediate. An existing PDF editor will be trialled for rendering, direct text editing, and export; no viewer or editor SDK is selected yet. Jev is a candidate for bounded grouping and region-label decisions, not for generating replacement text.

## Evidence required before integration

### Deterministic tests

Tests protect rules with a correct or incorrect answer, such as schema validation, metric calculations, approval checks, and output serialization.

### Quality evals

Resume evals measure:

- text recovery;
- reading order;
- spatial overlap;
- structural labels;
- edit locality;
- rendered output defects.

Browser evals will measure task completion, wrong actions, recovery, and forbidden-action attempts.

### Benchmarks

Every candidate run should capture wall time, CPU time, peak memory, model and provider, token or request usage when available, and hosted cost when known. Compare median and slow runs, not only the best run.

## Confirmed technology choices

| Area | Choice | Status |
|---|---|---|
| Marketing UI | Next.js App Router, React, TypeScript | Confirmed |
| Product UI | Next.js App Router, React, TypeScript | Confirmed |
| Product API | Python FastAPI | Confirmed |
| Shared UI | shadcn/ui in `packages/ui` | Confirmed |
| Task runner | Turborepo with pnpm workspaces | Confirmed |
| Python packaging | uv | Confirmed |
| Resume eval node models | Pydantic v2 in `evals/resume` | Confirmed |
| Product inference boundary | Python only, through Vercel AI Gateway | Confirmed |
| Resume parser | PyMuPDF | Selected for resume evaluation and planned product parsing; quality gate remains open |
| Editable resume format | Selected after fidelity and editability evaluation | Undecided |
| Browser framework | Selected by benchmark | Undecided |
| Browser models | JEV, local small models, and other candidates may be evaluated | Undecided |
| Product database and auth | Add when a proven workflow needs persistence | Deferred |

## Build order

1. Define the resume corpus, ground-truth format, metrics, and resource report.
2. Run the PyMuPDF span parser on the labelled corpus and record its quality and resource use.
3. Confirm PyMuPDF meets the written quality and resource thresholds.
4. Build a thin resume-region viewer only when visual inspection becomes the evaluation bottleneck.
5. Test selection, focused chat patches, visual diffs, and revision stability.
6. Define browser tasks and safety invariants.
7. Benchmark deterministic, local-model, hosted-model, and visual browser paths.
8. Integrate only the passing resume and browser capabilities into `services/api` and `apps/app`.
9. Add persistence, identity, approvals, deployment, and monitoring when the integrated workflow requires them.

## Decision rules

- A benchmark result must name its input corpus, code revision, model, runtime, and hardware context.
- Do not optimize against one personal resume or one job site.
- Keep raw private documents and page captures out of Git and routine logs.
- A low-cost model is useful only if it meets the quality and safety threshold.
- The browser never receives provider keys or unrestricted model-written scripts.
- Consequential external actions require a visible proposal and explicit approval.
- Do not create databases, migrations, auth flows, queues, or polished screens before the evaluated workflow needs them.

## Open decisions

- Resume corpus licensing and consent process
- Minimum passing scores for extraction, geometry, and edit locality
- Whether edited resumes preserve the original PDF design or use a regenerated format
- Which PDF editor SDK can support direct editing, region overlays, export, and focused diffs within acceptable licensing and privacy constraints
- Whether deterministic grouping is sufficient or Jev improves ambiguous region boundaries on a labelled corpus
- Whether PyMuPDF meets the resume quality and resource thresholds on the labelled corpus
- Browser benchmark sites and permitted automation methods
- Local model runtime and supported hardware floor
- Production database, authentication, hosting, and retention policy
