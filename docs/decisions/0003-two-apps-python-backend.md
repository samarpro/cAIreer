# 0003: Two Next.js apps and a Python backend

## Status

Accepted — 22 September 2026

## Context

The repository needed a monorepo before any product feature work. The previous map assumed one Next.js app (`apps/web`), TypeScript route handlers as the product API, and the OpenAI Agents SDK in TypeScript. The current stack choice is different: a public marketing site, a product app, PostgreSQL, shadcn/ui, a Python backend, and Pydantic AI for agents.

ADR 0002 still applies. This change is the workspace layout, not permission to start the functional product.

Marketing and the product UI are different programs. One is a public launch site that should ship to Vercel without product login, agents, or Postgres. The other is the signed-in product. Putting both in one Next.js app would couple their deploys, auth, and failure modes.

## Decision

Use pnpm workspaces with this layout:

- `apps/marketing`: Next.js public site. Hosted on Vercel. Owns the product introduction, waitlist UI, and research-invitation UI. Must not own product authentication, agent runs, or durable product records.
- `apps/app`: Next.js product UI. Owns signed-in screens and calls `services/api`. Must not write to Postgres or call model providers directly.
- `services/api`: FastAPI backend and Pydantic AI. Owns product HTTP APIs, PostgreSQL writes, and agent runs.
- `packages/ui`: shared shadcn/ui primitives. Screens that belong to one product stay in that app.

PostgreSQL is the source of truth, started locally with Docker Compose.

The two Next.js apps may share UI components. They do not share a deploy, a session, or a database connection. Waitlist storage remains undecided (ADR 0002). Until that is chosen, marketing must not claim a signup was saved.

A second UI library may be added later if shadcn/ui does not cover a specific need. Do not add one now.

This supersedes ADR 0001. Agent and model access live in Python through Pydantic AI, not a TypeScript model gateway.

Task running across these packages is covered in [0004](./0004-turborepo-task-runner.md).

## Consequences

- Marketing can go live while `apps/app` and `services/api` are still empty shells.
- A bug or outage in the product API should not take down the public site.
- Shared UI changes in `packages/ui` affect both Next.js apps.
- Database access belongs in Python unless a later decision says otherwise.
- Redis, queues, and extra services stay out until a real feature needs them.
