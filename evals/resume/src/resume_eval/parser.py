from __future__ import annotations

from pathlib import Path

import pymupdf

from resume_eval.schema import BoundingBox, ResumeNode

ANNOTATION_COLORS = (
    (1.0, 0.23, 0.19),
    (0.0, 0.48, 1.0),
    (0.20, 0.78, 0.35),
    (1.0, 0.58, 0.0),
    (0.69, 0.32, 0.87),
)


def draw_reading_order_label(
    page: pymupdf.Page,
    rect: pymupdf.Rect,
    reading_order: int,
    color: tuple[float, float, float],
    previous_badge_bottom: float,
    use_gutter: bool,
) -> float:
    label = str(reading_order + 1)
    label_width = pymupdf.get_text_length(label, fontname="helv", fontsize=7) + 4
    if use_gutter:
        left = 5.0
        top = max(rect.y0, previous_badge_bottom + 1)
        top = min(top, page.rect.y1 - 10)
    else:
        left = min(rect.x0, page.rect.x1 - label_width)
        top = rect.y0 - 10 if rect.y0 >= 10 else rect.y1
    badge = pymupdf.Rect(left, top, left + label_width, top + 10)
    if use_gutter:
        page.draw_line(
            (badge.x1, badge.y0 + 5),
            (rect.x0, rect.y0 + min(5, rect.height / 2)),
            color=color,
            width=0.4,
        )
    page.draw_rect(badge, color=color, fill=color)
    page.insert_text((left + 2, top + 8), label, fontname="helv", fontsize=7, color=(1, 1, 1))
    return badge.y1


def parse_pdf(path: Path) -> list[ResumeNode]:
    nodes: list[ResumeNode] = []
    with pymupdf.open(path) as document:
        for page_number, page in enumerate(document, start=1):
            # Keep the document's extraction order so the eval can measure its quality.
            for block_index, block in enumerate(page.get_text("dict")["blocks"]):
                if block["type"] != 0:
                    continue
                for line_index, line in enumerate(block["lines"]):
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue
                        x0, y0, x1, y1 = span["bbox"]
                        reading_order = len(nodes)
                        nodes.append(
                            ResumeNode(
                                node_id=f"page-{page_number}-span-{reading_order}",
                                page_number=page_number,
                                kind="unknown",
                                text=text,
                                bounding_box=BoundingBox(
                                    x=x0,
                                    y=y0,
                                    width=x1 - x0,
                                    height=y1 - y0,
                                ),
                                reading_order=reading_order,
                                style={
                                    "font_size": span["size"],
                                    "font": span["font"],
                                    "geometry_method": "pymupdf_span_bbox",
                                    "line_id": f"page-{page_number}-block-{block_index}-line-{line_index}",
                                },
                                confidence=0.0,
                            )
                        )

    annotate_pdf(path, nodes)
    return nodes


def annotate_pdf(
    path: Path, nodes: list[ResumeNode], output_path: Path | None = None
) -> Path:
    if output_path is None:
        output_path = Path(__file__).resolve().parents[2] / "results" / f"annotated-{path.name}"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with pymupdf.open(path) as document:
        for page_number, page in enumerate(document, start=1):
            # A one-character span remains in the eval data but gets no visible box.
            visible_nodes = [
                node for node in nodes if node.page_number == page_number and len(node.text.strip()) > 1
            ]
            use_gutter = bool(visible_nodes) and min(node.bounding_box.x for node in visible_nodes) >= 32
            previous_badge_bottom = -1.0
            for node in sorted(visible_nodes, key=lambda item: (item.bounding_box.y, item.bounding_box.x)):
                box = node.bounding_box
                rect = pymupdf.Rect(box.x, box.y, box.x + box.width, box.y + box.height)
                color = ANNOTATION_COLORS[node.reading_order % len(ANNOTATION_COLORS)]
                annotation = page.add_rect_annot(rect)
                annotation.set_colors(stroke=color)
                annotation.update()
                badge_bottom = draw_reading_order_label(
                    page, rect, node.reading_order, color, previous_badge_bottom, use_gutter
                )
                if use_gutter:
                    previous_badge_bottom = badge_bottom
        document.save(output_path)
    return output_path
