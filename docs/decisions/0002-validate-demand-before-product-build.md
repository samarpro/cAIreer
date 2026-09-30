# 0002: Validate demand before further product build

## Status

Accepted — 21 August 2026

## Context

cAIreer has a web foundation and initial model-gateway work, but the product promise and first functional workflow have not yet been tested with prospective users. Continuing directly into candidate profiles and automation would commit more engineering effort before confirming that the target audience values the proposed outcome.

The confirmed initial audience is ambitious students and early-career professionals who already use AI during their job search but want to reduce repetitive application work without losing control of how they are represented.

## Decision

Build and publish a focused product website before further functional product development. The website will explain the promise, collect waitlist interest, and invite selected people to research conversations.

The marketing site will be hosted on Vercel. The waitlist storage provider remains undecided; Supabase and dedicated email-list providers are candidates. The interface may be built before storage is connected, but it must not claim that a signup was saved until durable storage is configured and verified.

Waitlist conversion is evidence of interest in the promise, not proof of continued use or willingness to pay. Interviews and a small manually supported trial should inform the first functional workflow.

## Consequences

- New product infrastructure pauses while the validation release is completed and tested.
- The public website lives in `apps/marketing`. The signed-in product lives in `apps/app`. See [0003](./0003-two-apps-python-backend.md).
- Agent and model access now live in Python (ADR 0001 superseded by 0003).
- Waitlist storage, privacy wording, analytics, and deployment must be complete before public promotion.
- Product scope may change in response to evidence from signups, interviews, and manual trials.
