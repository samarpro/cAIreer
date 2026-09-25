from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

LINE_Y_TOLERANCE = 2.0


@dataclass(frozen=True)
class PdfLine:
    page: int
    text: str
    x: float
    y: float


def extract_lines(path: Path) -> list[PdfLine]:
    reader = PdfReader(path)
    fragments: list[tuple[int, float, float, str]] = []

    for page_number, page in enumerate(reader.pages, start=1):

        def visitor(text, _cm, tm, _font, _size, page_number=page_number):
            chunk = text.strip()
            if not chunk or "\n" in chunk:
                return
            fragments.append((page_number, float(tm[4]), float(tm[5]), chunk))

        page.extract_text(visitor_text=visitor)

    return group_fragments(fragments)


def group_fragments(
    fragments: list[tuple[int, float, float, str]],
) -> list[PdfLine]:
    """Join text that sits on the same visual line."""
    ordered = sorted(fragments, key=lambda item: (item[0], -item[2], item[1]))
    rows: list[list[tuple[int, float, float, str]]] = []

    for fragment in ordered:
        page, _x, y, _text = fragment
        if (
            rows
            and rows[-1][0][0] == page
            and abs(rows[-1][0][2] - y) <= LINE_Y_TOLERANCE
        ):
            rows[-1].append(fragment)
            continue
        rows.append([fragment])

    lines: list[PdfLine] = []
    for row in rows:
        row.sort(key=lambda item: item[1])
        page, x, y, _text = row[0]
        lines.append(
            PdfLine(
                page=page,
                text=" ".join(item[3] for item in row),
                x=x,
                y=y,
            )
        )
    return lines
