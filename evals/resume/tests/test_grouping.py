import json

import pytest

from resume_eval.grouping import group_lines, prepare_lines, ResumeLine
from resume_eval.schema import BoundingBox, ResumeNode


def lines(count=4):
    return [ResumeLine(line_id=f"L{i}", text=f"Resume line {i}", page_number=1,
                       source_ids=[f"S{i}"], boxes=[]) for i in range(count)]


def response(choice):
    return {"answers": {"boundary": {
        "type": "choice", "choice": choice, "confidence": 1,
        "probabilities": {option: float(option == choice)
                          for option in ("continue", "new_block", "uncertain")},
    }}}


def test_candidate_is_pending_and_fifo_preserves_saved_group():
    states = []
    def evaluate(state, questions):
        states.append(json.loads(state))
        return response("continue")
    result = group_lines(lines(), evaluate, context_lines=2)
    assert result["groups"][0]["line_ids"] == ["L0", "L1", "L2", "L3"]
    assert result["groups"][0]["source_ids"] == ["S0", "S1", "S2", "S3"]
    assert [line["line_id"] for line in states[-1]["current_block"]] == ["L1", "L2"]
    assert states[-1]["candidate_line"]["line_id"] == "L3"
    assert states[-1]["current_block_omitted_lines"] == 1
    for state in states:
        assert state["candidate_line"] not in state["current_block"] + state["recent_context"]


def test_new_and_uncertain_start_groups_then_become_context():
    choices = iter(["new_block", "uncertain", "continue"])
    states = []
    def evaluate(state, questions):
        states.append(json.loads(state))
        return response(next(choices))
    result = group_lines(lines(), evaluate)
    assert [g["line_ids"] for g in result["groups"]] == [["L0"], ["L1"], ["L2", "L3"]]
    assert [line["line_id"] for line in states[1]["recent_context"]] == ["L0"]
    assert [line["line_id"] for line in states[1]["current_block"]] == ["L1"]


def test_budget_evicts_oldest_before_call():
    states = []
    def counter(payload):
        state = json.loads(json.loads(payload)["state"])
        return 100 * (len(state["current_block"]) + len(state["recent_context"]) + 1)
    def evaluate(state, questions):
        states.append(json.loads(state))
        return response("continue")
    result = group_lines(lines(), evaluate, token_budget=200, count_tokens=counter)
    assert [line["line_id"] for line in states[-1]["current_block"]] == ["L2"]
    assert len(result["groups"][0]["line_ids"]) == 4


def test_oversized_required_pair_never_calls_model():
    def evaluate(*args):
        pytest.fail("Oversized request must not reach the model")
    with pytest.raises(ValueError, match="exceed"):
        group_lines(lines(2), evaluate, token_budget=1)


def test_invalid_answer_stops_before_next_candidate():
    calls = []
    def evaluate(state, questions):
        calls.append(state)
        result = response("continue")
        result["answers"]["boundary"]["confidence"] = float("nan")
        return result
    with pytest.raises(ValueError):
        group_lines(lines(), evaluate)
    assert len(calls) == 1


def test_empty_and_single_line_need_no_decision():
    def evaluate(*args):
        pytest.fail("No boundary to decide")
    assert group_lines([], evaluate)["groups"] == []
    assert group_lines(lines(1), evaluate)["groups"][0]["line_ids"] == ["L0"]


def test_prepare_lines_keeps_columns_separate_and_source_boxes():
    nodes = [ResumeNode(node_id=f"S{i}", text=text, page_number=1,
                        kind="unknown", reading_order=i,
                        bounding_box=BoundingBox(x=x, y=10, width=10, height=10),
                        style={"line_id": key}) for i, (text, x, key) in enumerate([
                            ("Engineer", 10, "left"), ("role", 22, "left"),
                            ("2026", 200, "right")])]
    result = prepare_lines(nodes)
    assert [line.text for line in result] == ["Engineer role", "2026"]
    assert result[0].source_ids == ["S0", "S1"]
    assert len(result[0].boxes) == 2


def test_duplicate_sources_are_rejected():
    sample = lines(2)
    sample[1].source_ids = sample[0].source_ids
    with pytest.raises(ValueError, match="only one line"):
        group_lines(sample, lambda *args: response("continue"))
