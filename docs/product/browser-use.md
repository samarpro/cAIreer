# Browser-use evaluation contract

## Goal

Find the fastest and cheapest approach that can reliably navigate permitted job-listing pages and extract job information while keeping risky actions under human control.

## Candidate layers

1. Deterministic DOM and accessibility-tree rules
2. Site-specific adapters where stable and permitted
3. A small local model for ambiguous interpretation or control ranking
4. A hosted text or visual model as a measured fallback

The benchmark decides which layers stay. No model or framework is assumed to win.

## Shared capability

Navigation and scraping may share page snapshots, control descriptions, and site adapters. Scraping is read-only. Applying, submitting, sending, or posting is a separate permission class.

## Required measurements

- Task completion rate
- Wrong-action and recovery rate
- Forbidden-action attempts
- Median and slow-run latency
- Model requests, tokens, and hosted cost
- Local CPU time and peak memory
- Number of browser actions

## Safety invariants

- Do not expose cookies, passwords, provider keys, or password-manager data.
- Do not execute arbitrary model-written JavaScript.
- Show consequential actions before execution.
- Require explicit approval before submit, send, or post.
- Record which model, code revision, and task produced each benchmark result.
