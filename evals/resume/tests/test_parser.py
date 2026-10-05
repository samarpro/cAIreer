import pymupdf
import pytest

from resume_eval.parser import annotate_pdf, merge_fragments, parse_pdf
from resume_eval.schema import BoundingBox, ResumeNode


def test_merging_retains_source_fragments_without_chaining_rows_or_crossing_pages():
    def fragment(node_id, page, x, y, order):
        return ResumeNode(
            node_id=node_id,
            page_number=page,
            kind="unknown",
            text=node_id,
            bounding_box=BoundingBox(x=x, y=y, width=10, height=10),
            reading_order=order,
            style={"font": "Helvetica", "font_size": 10 if node_id == "left" else 12},
        )

    nodes = [
        fragment("second-page", 2, 0, 0, 0),
        fragment("next-row", 1, 0, 104, 1),
        fragment("right", 1, 80, 100, 2),
        fragment("left", 1, 10, 102, 3),
    ]

    ordered = merge_fragments(nodes, y_tolerance=2)

    assert [node.text for node in ordered] == ["left right", "next-row", "second-page"]
    assert [node.reading_order for node in ordered] == [0, 1, 2]
    assert ordered[0].bounding_box == BoundingBox(x=10, y=100, width=80, height=12)
    assert ordered[0].style["font"] == "Helvetica"
    assert "font_size" not in ordered[0].style
    sources = ordered[0].style["source_fragments"]
    assert [source["node_id"] for source in sources] == ["left", "right"]
    assert [source["style"]["font_size"] for source in sources] == [10, 12]
    assert [node.node_id for node in ordered[1:]] == ["next-row", "second-page"]
    assert [node.reading_order for node in nodes] == [0, 1, 2, 3]


def test_span_geometry_and_single_character_annotation_filter(tmp_path):
    source = tmp_path / "source.pdf"
    document = pymupdf.open()
    page = document.new_page(width=200, height=200)
    page.insert_text((40, 50), "A", fontsize=12)
    page.insert_text((40, 80), "WWWW", fontsize=12)
    page.insert_text((40, 110), "iiii", fontsize=12)
    document.save(source)
    document.close()

    nodes = parse_pdf(source)

    assert [node.text for node in nodes] == ["A", "WWWW", "iiii"]
    assert [node.reading_order for node in nodes] == [0, 1, 2]
    assert nodes[0].bounding_box.x == pytest.approx(40)
    assert nodes[1].bounding_box.width > nodes[2].bounding_box.width
    assert all(node.style["geometry_method"] == "pymupdf_span_bbox" for node in nodes)

    annotated = annotate_pdf(source, nodes, tmp_path / "annotated.pdf")
    with pymupdf.open(annotated) as output:
        output_page = output[0]
        annotations = list(output_page.annots())
        assert len(annotations) == 2
        assert annotations[0].rect.x0 == pytest.approx(nodes[1].bounding_box.x, abs=2)
        labelled_text = output_page.get_text()
        assert "2" in labelled_text
        assert "3" in labelled_text
        assert "1" not in labelled_text
    with pymupdf.open(source) as original:
        assert original[0].first_annot is None
