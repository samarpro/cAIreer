from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class BoundingBox(BaseModel):
    model_config = ConfigDict(frozen=True)

    x: float
    y: float
    width: float
    height: float

    @property
    def area(self) -> float:
        return max(0.0, self.width) * max(0.0, self.height)


class ResumeNode(BaseModel):
    model_config = ConfigDict(frozen=True)

    node_id: str
    page_number: int
    kind: str
    text: str
    bounding_box: BoundingBox
    reading_order: int
    style: dict[str, Any] = Field(default_factory=dict)
    parent_node_id: str | None = None
    confidence: float = 0.0
