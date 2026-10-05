import pytest
from pydantic import ValidationError

from resume_eval.metrics import evaluate_nodes, intersection_over_union
from resume_eval.schema import BoundingBox, ResumeNode


def node(
    node_id: str,
    text: str,
    order: int,
    box: BoundingBox | None = None,
    kind: str = "experience_description",
) -> ResumeNode:
    return ResumeNode(
        node_id=node_id,
        page_number=1,
        kind=kind,
        text=text,
        bounding_box=box or BoundingBox(x=10, y=10 + order * 20, width=100, height=10),
        reading_order=order,
        confidence=1.0,
    )


def test_identical_nodes_score_one():
    expected = [node("one", "Built a report", 0), node("two", "Reduced errors", 1)]

    scores = evaluate_nodes(expected, expected)

    assert scores == {
        "text_recovery": 1.0,
        "reading_order": 1.0,
        "node_coverage": 1.0,
        "spatial_overlap": 1.0,
        "label_accuracy": 1.0,
    }


def test_wrong_order_and_missing_text_reduce_scores():
    expected = [node("one", "Built a report", 0), node("two", "Reduced errors", 1)]
    actual = [node("two", "Reduced errors", 0)]

    scores = evaluate_nodes(expected, actual)

    assert scores["text_recovery"] < 1.0
    assert scores["reading_order"] < 1.0
    assert scores["node_coverage"] == 0.5


def test_partial_box_overlap_is_measured():
    left = BoundingBox(x=0, y=0, width=10, height=10)
    right = BoundingBox(x=5, y=0, width=10, height=10)

    assert intersection_over_union(left, right) == 50 / 150


def test_case_node_validates_nested_box_and_serializes():
    raw = {
        "node_id": "name",
        "page_number": 1,
        "kind": "name",
        "text": "Taylor Example",
        "bounding_box": {"x": 54, "y": 742, "width": 160, "height": 18},
        "reading_order": 0,
    }

    parsed = ResumeNode.model_validate(raw)

    assert isinstance(parsed.bounding_box, BoundingBox)
    assert parsed.model_dump()["bounding_box"] == raw["bounding_box"]
    assert parsed.style == {}

    with pytest.raises(ValidationError, match="bounding_box.width"):
        ResumeNode.model_validate({**raw, "bounding_box": {**raw["bounding_box"], "width": "wide"}})
