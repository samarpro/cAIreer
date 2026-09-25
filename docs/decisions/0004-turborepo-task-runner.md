# 0004: Turborepo as the monorepo task runner

## Status

Accepted — 22 September 2026

## Context

This repo is several programs in one git tree: two Next.js apps, a Python API, and shared UI. pnpm already installs JavaScript dependencies and links local packages. It does not run `dev`, `build`, and `lint` across those packages in dependency order, and it does not skip unchanged work.

Without a runner, each package needs its own terminal or a handmade script. That is enough for one app. It does not scale once `packages/ui` must finish before the apps, or CI should rebuild only what changed.

shadcn/ui generated the first Turborepo files. shadcn does not run the terminal after that. Next.js also prints "Turbopack"; that is Next's bundler inside `next dev` / `next build`, not the `turbo` CLI.

## Decision

Use Turborepo (`turbo`) to run workspace scripts. Root `package.json` scripts call turbo (`pnpm dev` is `turbo dev`). [`turbo.json`](../../turbo.json) defines the tasks. Each package keeps its own real command (`next dev`, `uv run fastapi dev`, and so on).

pnpm stays the JavaScript installer. uv stays the Python installer. Do not run `npm install` in this repo.

The `turbo` command is Turborepo. Turbopack is Next.js. They are not the same tool.

## Consequences

- One command can start marketing, the product app, and the API.
- Turbo can cache `build` and skip a package whose inputs did not change.
- `"dependsOn": ["^build"]` means "build this package's workspace dependencies first."
- Python still uses uv. Turbo only invokes the `dev` script in `services/api/package.json`.
