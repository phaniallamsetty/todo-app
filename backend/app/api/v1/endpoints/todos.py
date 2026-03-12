from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Query

from app.schemas.todo import TodoCreate, TodoListResponse, TodoResponse, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=TodoListResponse)
async def list_todos(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    completed: bool | None = Query(default=None),
    priority: Literal["low", "medium", "high"] | None = Query(default=None),
    search: str | None = Query(default=None),
) -> TodoListResponse:
    """List todos with optional filtering and pagination."""
    raise NotImplementedError


@router.post("", response_model=TodoResponse, status_code=201)
async def create_todo(body: TodoCreate) -> TodoResponse:
    """Create a new todo."""
    raise NotImplementedError


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: UUID) -> TodoResponse:
    """Get a todo by ID."""
    raise NotImplementedError


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: UUID, body: TodoUpdate) -> TodoResponse:
    """Update a todo by ID."""
    raise NotImplementedError


@router.delete("/{todo_id}", status_code=204)
async def delete_todo(todo_id: UUID) -> None:
    """Delete a todo by ID."""
    raise NotImplementedError
