# Resume evals

The parser preserves PyMuPDF spans, boxes, fonts, and native line IDs. Optional
Jev grouping assembles those spans into lines in extraction order, then processes
each next line as a pending candidate. It does not use y matching to merge columns.

## Sequential grouping

Start the API with the configuration in [the API README](../../services/api/README.md).
Set `MODEL_GATEWAY_TOKEN` for the eval process too. `MODEL_GATEWAY_API_URL` defaults
to `http://127.0.0.1:8000`. From the repository root:

```sh
PYTHONPATH=evals/resume/src evals/resume/.venv/bin/python -m resume_eval.cli \
  path/to/case.json --group-with-jev --context-lines 8
```

This makes real model calls through the internal API. Without `--group-with-jev`,
the eval runs deterministic parsing only.

Each call contains processed `recent_context`, the visible tail of `current_block`,
and a separate `candidate_line`. The candidate joins the processed queue only
after the answer passes validation. `continue` extends the saved group;
`new_block` and `uncertain` start a separate group. Groups keep every source ID
even after context eviction. Model failures stop the run rather than silently
making up a grouping decision.

The queue keeps eight processed lines by default. Before each call, it also removes
oldest lines until the complete serialized state and question fit the budget.
The previous line and candidate must fit together or the run fails before calling
the model. `current_block_omitted_lines` reports how much of the saved block is absent.

`--grouping-token-budget` defaults to 24000. The counter uses UTF-8 byte length as
a conservative token estimate, not an exact Jev token count. This leaves headroom
below the documented 32k state-plus-question limit. The grouping function accepts
an injectable counter for a verified tokenizer. The internal API's 100000-character
state limit is checked too. See [Jev limits](https://docs.typesafe.ai/models).

The report's `grouping` field contains lines with original boxes, groups with
source membership, and decisions with context IDs, model, usage, and request size.
Existing parser quality metrics still measure raw spans. Semantic group accuracy
requires separately labelled groups; these tests verify the loop, not Jev accuracy.
The PDF annotation output still shows the original spans.

```sh
PYTHONPATH=evals/resume/src evals/resume/.venv/bin/python -m pytest \
  evals/resume/tests/test_grouping.py -q
```
