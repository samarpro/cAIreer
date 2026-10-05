# Evaluation-first roadmap

The product is built in evidence gates. Completing code is not enough to pass a gate.

## Gate 1: resume baseline

- [x] Define the resume node and run-report contracts
- [x] Separate evaluation code from product code
- [ ] Add at least five synthetic, public, or consented resumes with reviewed ground truth
- [ ] Record PyMuPDF span quality and resource use
- [ ] Write passing thresholds before comparing more parsers

Exit evidence: a reproducible report identifies where the baseline loses text, order, structure, or geometry and how much time and memory it consumes.

## Gate 2: selectable resume

- [x] Select PyMuPDF as the spatial parser candidate
- [ ] Confirm PyMuPDF meets the quality and resource thresholds on the labelled corpus
- [ ] Label meaningful selectable regions and compare deterministic grouping with Jev-assisted decisions
- [ ] Trial existing PDF editors for direct text editing, custom region overlays, export, and edit locality
- [ ] Render pages with hover and keyboard previews of selectable regions
- [ ] Open a compact chat for the selected node
- [ ] Store a proposed patch against stable node IDs
- [ ] Show a visual diff and require accept or reject
- [ ] Prove unrelated nodes remain unchanged

Exit evidence: a user can change one selected region in the evaluation corpus without an unintended document change.

## Gate 3: browser benchmark

- [ ] Define repeatable navigation, extraction, and recovery tasks
- [ ] Add deterministic DOM or accessibility-tree baseline
- [ ] Compare JEV and small local-model candidates where applicable
- [ ] Add a hosted or visual fallback only for tasks the cheap path misses
- [ ] Measure completion, latency, cost, CPU, memory, and forbidden actions

Exit evidence: one layered approach meets written speed, cost, quality, and safety thresholds.

## Gate 4: product integration

- [ ] Move passing capabilities behind `services/api`
- [ ] Add only the persistence and identity the workflow requires
- [ ] Build the signed-in resume and browser experience in `apps/app`
- [ ] Add approval records before submit, send, or post
- [ ] Run the complete upload-to-edit and job-navigation flows

Exit evidence: the integrated workflow passes the same evals plus end-to-end product tests.
