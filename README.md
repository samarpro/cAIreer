# cAIreer

cAIreer is a job-search assistant that reduces repetitive work while keeping the job seeker in control of how they are represented.

The repository is currently eval-first. Resume parsing and focused annotation must be measured before they enter the product. Browser navigation and job extraction follow the same rule.

## Repository layout

- [`apps/marketing`](apps/marketing) is the public site at [http://localhost:3000](http://localhost:3000).
- [`apps/app`](apps/app) is the product shell at [http://localhost:3001](http://localhost:3001). Experimental features do not live here.
- [`services/api`](services/api) is the FastAPI shell at [http://localhost:8000/health](http://localhost:8000/health).
- [`evals/resume`](evals/resume) owns the active resume parser evaluation.
- PyMuPDF is the selected resume parser; its quality and resource thresholds still need to be measured before product integration.
- [`evals/browser`](evals/browser) records the next browser benchmark boundary without choosing a framework early.
- [`TECH-MAP.md`](TECH-MAP.md) records ownership and architecture.
- [`ROADMAP.md`](ROADMAP.md) lists the evidence gates.

## Local development

Requirements:

- Node.js 20.9 or newer
- pnpm 11.13.1
- uv

```bash
pnpm install
uv sync --directory services/api
pnpm dev
```

Run application checks:

```bash
pnpm check
pnpm build
```

Run the resume evaluation unit tests:

```bash
uv sync --project evals/resume
uv run --project evals/resume pytest
```

The evaluation runner needs labelled PDF cases before it can produce a meaningful quality report. Private resumes belong in `evals/resume/fixtures/private`, which Git ignores.
