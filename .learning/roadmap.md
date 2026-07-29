# Learning roadmap

This roadmap follows the product build order in `TECH-MAP.md`. It stays intentionally short and should change when implementation evidence changes the plan.

| Slice | Product outcome | Main learning edge | Status |
|---|---|---|---|
| 1. Web foundation | A2A Hire runs locally with shared lint and type checks | Application boundaries and evidence from tooling | Complete |
| 2. Ollama and LM Studio gateway | The same internal request works with either local runtime | Adapter pattern and capability contracts | Contract added; live proof next |
| 3. Candidate profile | A job seeker can enter and persist a useful profile | Schemas, validation, and database constraints | Planned |
| 4. Job workspace | A job can be captured and related to an application | Relationships and server-side data flow | Planned |
| 5. Approval states | Consequential actions require a durable decision | State machines and business invariants | Planned |

Later queue, agent, Python automation, and deployment slices remain in `TECH-MAP.md`; they will move here when close enough to teach and build concretely.
