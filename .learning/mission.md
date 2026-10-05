# Learning mission

## Product outcome
cAIreer helps ambitious students and early-career professionals use AI in their job search without losing control of how they are represented. The next proven capability is a resume that can be parsed into selectable regions and changed through a focused chat without unrelated edits.

## Learning outcome
Sam wants to design, implement, debug, and explain the system without depending entirely on AI. The current edge is learning to separate deterministic tests, quality evals, and cost or resource benchmarks before integrating a capability into the product.

## Success evidence
- A labelled resume corpus exposes parser strengths and failure cases
- Resume runs report quality, latency, hosted cost, CPU time, and peak memory
- Sam can explain why experimental code lives in `evals` until it meets a written threshold
- A later browser benchmark compares deterministic, local-model, and hosted-model paths on the same tasks

## Constraints
- Sam is learning software engineering while building the product
- Guided shipping: keep product progress moving, teach one concept per slice
- Do not build unused infrastructure
- Do not integrate an experimental capability into `apps/app` or `services/api` before its evaluation contract exists

## Current assumptions
- Sam prefers working in code over long lectures
- Default teaching mode is Guided shipping unless Sam asks otherwise
