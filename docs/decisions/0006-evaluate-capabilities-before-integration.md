# 0006: Evaluate capabilities before product integration

## Status

Accepted, 28 September 2026

## Context

The repository had an uncommitted implementation of identity, profiles, jobs, applications, approvals, a preparation agent, and a Chrome extension. Those modules formed a plausible product skeleton, but the system did not yet know whether it could parse a resume with enough spatial detail for focused editing or navigate job sites quickly and cheaply.

Building the surrounding product first made the unproven capabilities harder to isolate and measure.

## Decision

Resume parsing and editing are evaluated before product integration. Browser navigation and job extraction follow. Final UI integration follows both.

Experimental code, labelled fixtures, quality scoring, and cost or resource measurements live in `evals`. `services/api` and `apps/app` receive a capability only after its evaluation contract exists and it meets written thresholds.

The resume representation preserves stable node IDs, page geometry, reading order, structure, and revisions. The original uploaded document stays immutable. Focused chat edits produce reviewable patches against selected nodes.

Browser candidates share a repeatable task set. Deterministic page structure is the first path, small local or hosted models handle ambiguity, and expensive visual reasoning is a measured fallback. Model and framework choices remain open until benchmarked.

## Consequences

- The premature product modules and database stack are removed.
- The existing PDF and JEV scripts move out of `services` and become an evaluation baseline.
- Personal resume fixtures are not tracked by default.
- Thin inspection interfaces can be built before the final UI when they help evaluation.
- Marketing remains independent and can continue shipping.
- Identity, persistence, approvals, and polished product screens return when the evaluated workflow needs them.

This decision narrows ADR 0002. Product validation still matters, but capability evaluation may proceed alongside marketing rather than waiting for the entire marketing program to finish.
