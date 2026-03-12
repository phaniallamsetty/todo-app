from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.repositories.todo_repository import TodoRepository
from app.schemas.envelope import Envelope, Meta
from app.schemas.todo import TodoCreate, TodoListResponse, TodoResponse, TodoUpdate
from app.services.todo_service import TodoService

router = APIRouter(prefix="/todos", tags=["todos"])


def get_todo_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TodoService:
    return TodoService(repo=TodoRepository(session), session=session)


def _meta() -> Meta:
    return Meta(version=settings.app_version)


@router.get("", response_model=Envelope[TodoListResponse])
async def list_todos(
    service: Annotated[TodoService, Depends(get_todo_service)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    completed: bool | None = Query(default=None),
    priority: Literal["low", "medium", "high"] | None = Query(default=None),
    search: str | None = Query(default=None),
) -> Envelope[TodoListResponse]:
    result = await service.list_todos(page, page_size, completed, priority, search)
    return Envelope(data=result, meta=_meta(), error=None)


@router.post("", response_model=Envelope[TodoResponse], status_code=201)
async def create_todo(
    body: TodoCreate,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> Envelope[TodoResponse]:
    result = await service.create_todo(body)
    return Envelope(data=result, meta=_meta(), error=None)


@router.get("/{todo_id}", response_model=Envelope[TodoResponse])
async def get_todo(
    todo_id: UUID,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> Envelope[TodoResponse]:
    result = await service.get_todo(todo_id)
    return Envelope(data=result, meta=_meta(), error=None)


@router.put("/{todo_id}", response_model=Envelope[TodoResponse])
async def update_todo(
    todo_id: UUID,
    body: TodoUpdate,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> Envelope[TodoResponse]:
    result = await service.update_todo(todo_id, body)
    return Envelope(data=result, meta=_meta(), error=None)


@router.delete("/{todo_id}", status_code=204)
async def delete_todo(
    todo_id: UUID,
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> None:
    await service.delete_todo(todo_id)
