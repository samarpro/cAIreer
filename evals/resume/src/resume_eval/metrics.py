from __future__ import annotations

import re
from difflib import SequenceMatcher

from resume_eval.schema import BoundingBox, ResumeNode


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().casefold()


def text_recovery(expected: list[ResumeNode], actual: list[ResumeNode]) -> float:
    expected_text = "\n".join(node.text for node in expected)
    actual_text = "\n".join(node.text for node in actual)
    return SequenceMatcher(None, normalize(expected_text), normalize(actual_text)).ratio()


def reading_order_score(expected: list[ResumeNode], actual: list[ResumeNode]) -> float:
    expected_rows = [normalize(node.text) for node in sorted(expected, key=lambda node: node.reading_order)]
    actual_rows = [normalize(node.text) for node in sorted(actual, key=lambda node: node.reading_order)]
    return SequenceMatcher(None, expected_rows, actual_rows).ratio()


def intersection_over_union(left: BoundingBox, right: BoundingBox) -> float:
    left_x2 = left.x + left.width
    left_y2 = left.y + left.height
    right_x2 = right.x + right.width
    right_y2 = right.y + right.height
    intersection_width = max(0.0, min(left_x2, right_x2) - max(left.x, right.x))
    intersection_height = max(0.0, min(left_y2, right_y2) - max(left.y, right.y))
    intersection = intersection_width * intersection_height
    union = left.area + right.area - intersection
    return intersection / union if union else 0.0


def matched_nodes(
    expected: list[ResumeNode], actual: list[ResumeNode]
) -> list[tuple[ResumeNode, ResumeNode]]:
    remaining = list(actual)
    matches: list[tuple[ResumeNode, ResumeNode]] = []
    for expected_node in expected:
        normalized = normalize(expected_node.text)
        match = next(
            (
                node
                for node in remaining
                if node.page_number == expected_node.page_number
                and normalize(node.text) == normalized
            ),
            None,
        )
        if match is not None:
            matches.append((expected_node, match))
            remaining.remove(match)
    return matches


def evaluate_nodes(expected: list[ResumeNode], actual: list[ResumeNode]) -> dict[str, float]:
    matches = matched_nodes(expected, actual)
    geometry = [
        intersection_over_union(expected_node.bounding_box, actual_node.bounding_box)
        for expected_node, actual_node in matches
    ]
    labelled = [
        float(expected_node.kind == actual_node.kind)
        for expected_node, actual_node in matches
    ]
    return {
        "text_recovery": text_recovery(expected, actual),
        "reading_order": reading_order_score(expected, actual),
        "node_coverage": len(matches) / len(expected) if expected else 1.0,
        "spatial_overlap": sum(geometry) / len(geometry) if geometry else 0.0,
        "label_accuracy": sum(labelled) / len(labelled) if labelled else 0.0,
    }
