# cAIreer

cAIreer is a job-search assistant that automates repetitive application work while keeping the job seeker in control of how they are represented.

## Repo layout

- [`apps/marketing`](apps/marketing): public site. No product login. [http://localhost:3000](http://localhost:3000)
- [`apps/app`](apps/app): signed-in product UI. [http://localhost:3001](http://localhost:3001)
- [`services/api`](services/api): Python FastAPI and Pydantic AI. [http://localhost:8000/health](http://localhost:8000/health)

pnpm installs JavaScript dependencies. Turborepo (`pnpm dev`, `pnpm build`) runs each package's scripts. They are not the same tool. Details: [`TECH-MAP.md`](TECH-MAP.md), [0003](docs/decisions/0003-two-apps-python-backend.md), [0004](docs/decisions/0004-turborepo-task-runner.md).

## Local development

Requirements:

- Node.js 20.9 or newer
- pnpm 11.13.1
- uv
- Docker, if you want local PostgreSQL

```bash
pnpm install
uv sync --directory services/api
docker compose up -d
pnpm dev
```

Run the shared quality gate before committing:

```bash
pnpm check
pnpm build
```
