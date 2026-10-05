# Browser evaluation

This is the next capability gate after resume annotation. It contains no browser framework or model dependency yet.

The first implementation should add:

1. repeatable local pages with known controls and expected outcomes;
2. task JSON for navigation, extraction, recovery, and forbidden actions;
3. a deterministic DOM or accessibility-tree baseline;
4. one report format covering completion, actions, latency, cost, CPU, memory, and safety failures;
5. adapters for candidate local or hosted models only after the baseline runs.

Job extraction and navigation may share perception code. Submit, send, and post remain a separate approval-controlled action class.
