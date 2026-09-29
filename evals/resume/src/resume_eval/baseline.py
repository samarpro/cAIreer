from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, ConfigDict
from pypdf import PageObject, PdfReader, PdfWriter, annotations, mult
from pypdf.generic import ArrayObject, ContentStream, FloatObject, NameObject

from resume_eval.schema import BoundingBox, ResumeNode

LINE_Y_TOLERANCE = 2.0
ANNOTATION_COLORS = (
    (1.0, 0.23, 0.19),
    (0.0, 0.48, 1.0),
    (0.20, 0.78, 0.35),
    (1.0, 0.58, 0.0),
    (0.69, 0.32, 0.87),
)


class Fragment(BaseModel):
    model_config = ConfigDict(frozen=True)

    page_number: int
    text: str
    x: float
    y: float
    font_size: float

    @property
    def estimated_width(self) -> float:
        return max(self.font_size * 0.5 * len(self.text), self.font_size * 0.5)


def calculate_fragment_origin(
    cm: list[float], text_matrix: list[float], page_matrix: list[float]
) -> tuple[float, float]:
    page_text_matrix = mult(mult(text_matrix, cm), page_matrix)
    return float(page_text_matrix[4]), float(page_text_matrix[5])


def group_fragments(fragments: list[Fragment]) -> list[ResumeNode]:
    # ordered = sorted(
    #     (fragment for fragment in fragments if fragment.text.strip()),
    #     key=lambda item: (item.page_number, -item.y, item.x),
    # )
    rows: list[list[Fragment]] = []

    for fragment in fragments:
        if (
            rows
            and rows[-1][0].page_number == fragment.page_number
            and abs(rows[-1][0].y - fragment.y) <= LINE_Y_TOLERANCE and False
        ):
            rows[-1].append(fragment)
        else:
            rows.append([fragment])

    nodes: list[ResumeNode] = []
    for reading_order, row in enumerate(rows):
        row.sort(key=lambda item: item.x)
        first = row[0]
        last = row[-1]
        font_size = max(fragment.font_size for fragment in row)
        right = last.x + last.estimated_width
        nodes.append(
            ResumeNode(
                node_id=f"page-{first.page_number}-line-{reading_order}",
                page_number=first.page_number,
                kind="unknown",
                text=" ".join(fragment.text.strip() for fragment in row),
                bounding_box=BoundingBox(
                    x=first.x,
                    y=first.y,
                    width=max(0.0, right - first.x),
                    height=font_size,
                ),
                reading_order=reading_order,
                style={
                    "font_size": font_size,
                    "geometry_method": "estimated_from_text_length",
                },
                confidence=0.0,
            )
        )
    return nodes

def convert_fragments_to_nodes(fragments: list[Fragment]) -> list[ResumeNode]:
    nodes: list[ResumeNode] = []
    for reading_order, fragment in enumerate(fragments):
        nodes.append(
            ResumeNode(
                node_id=f"page-{fragment.page_number}-line-{reading_order}",
                page_number=fragment.page_number,
                kind="unknown",
                text=fragment.text.strip(),
                bounding_box=BoundingBox(
                    x=fragment.x,
                    y=fragment.y,
                    width=max(0.0, fragment.estimated_width),
                    height=fragment.font_size,
                ),
                reading_order=reading_order,
                style={
                    "font_size": fragment.font_size,
                    "geometry_method": "estimated_from_text_length",
                },
                confidence=0.0,
            )
        )
    return nodes


def parse_pdf(path: Path) -> list[ResumeNode]:
    reader = PdfReader(path)
    fragments: list[Fragment] = []
    for page_number, page in enumerate(reader.pages, start=1):
        page_matrix = next(
            (
                [float(value) for value in operands]
                for operands, operator in ContentStream(
                    page.get_contents(), reader
                ).operations
                if operator == b"cm"
            ),
            [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
        )
        i=0
        def visitor(
            text: str,
            _cm: list[float],
            text_matrix: list[float],
            _font: dict | None,
            font_size: float,
            page_number: int = page_number,
        ) -> None:
            nonlocal i
            for chunk in text.splitlines():
                clean = chunk.strip()
                if clean:
                    print(f"Processing text: {clean}, {i}, {_cm}, {text_matrix}")
                    # if i!=0:
                    #     return
                    # i+=1
                    new_x, new_y = calculate_fragment_origin(
                        _cm, text_matrix, page_matrix
                    )
                    fragments.append(
                        Fragment(
                            page_number=page_number,
                            text=clean,
                            x=new_x,
                            y=new_y,
                            font_size=float(font_size),
                        )
                    )
                    print(f"Added fragment: {fragments[-1].x}, {fragments[-1].y}, {fragments[-1].font_size}")
                

        page.extract_text(visitor_text=visitor)
    
        
    
    annotate_pdf(path, convert_fragments_to_nodes(fragments))
    return convert_fragments_to_nodes(fragments)

def annotate_pdf(path: Path, nodes: list[ResumeNode]) -> None:
    reader = PdfReader(path)
    writer = PdfWriter()
    
    pages = list(reader.pages)
    for page in pages:
        annotated_page: PageObject = writer.add_page(page)
        for node in nodes:
            if node.page_number == pages.index(page) + 1:
                print(f"Annotating node {node.node_id} on page {node.page_number}")
                annotation = annotations.Rectangle((node.bounding_box.x+node.bounding_box.width, node.bounding_box.y+node.bounding_box.height, node.bounding_box.x, node.bounding_box.y), title_bar=node.kind)
                annotation[NameObject("/C")] = ArrayObject(
                    FloatObject(channel)
                    for channel in ANNOTATION_COLORS[
                        node.reading_order % len(ANNOTATION_COLORS)
                    ]
                )
                writer.add_annotation(annotated_page, annotation)
    result_path = Path(__file__).resolve().parents[2] / "results" / f"annotated-{path.name}"
    writer.write(result_path)
        
