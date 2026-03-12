from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    """Shared fields for Todo schemas."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    priority: Literal["low", "medium", "high"] = "medium"


class TodoCreate(TodoBase):
    """Schema for creating a new Todo."""


class TodoUpdate(BaseModel):
    """Schema for partially updating a Todo (all fields optional)."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    completed: bool | None = None
    priority: Literal["low", "medium", "high"] | None = None


class TodoResponse(TodoBase):
    """Schema for Todo API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    completed: bool
    created_at: datetime
    updated_at: datetime | None = None


class TodoListResponse(BaseModel):
    """Schema for paginated Todo list responses."""

    items: list[TodoResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
