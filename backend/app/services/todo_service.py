import math
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.todo_exceptions import TodoNotFoundException
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoListResponse, TodoResponse, TodoUpdate


class TodoService:
    def __init__(self, repo: TodoRepository, session: AsyncSession) -> None:
        self._repo = repo
        self._session = session

    async def get_todo(self, id: uuid.UUID) -> TodoResponse:
        todo = await self._repo.get_by_id(id)
        if todo is None:
            raise TodoNotFoundException(id=id)
        return TodoResponse.model_validate(todo)

    async def list_todos(
        self,
        page: int,
        page_size: int,
        completed: bool | None,
        priority: str | None,
        search: str | None,
    ) -> TodoListResponse:
        skip = (page - 1) * page_size
        todos, total = await self._repo.get_all(
            skip=skip,
            limit=page_size,
            completed=completed,
            priority=priority,
            search=search,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        return TodoListResponse(
            items=[TodoResponse.model_validate(t) for t in todos],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def create_todo(self, data: TodoCreate) -> TodoResponse:
        todo = await self._repo.create(data.model_dump())
        await self._session.commit()
        return TodoResponse.model_validate(todo)

    async def update_todo(self, id: uuid.UUID, data: TodoUpdate) -> TodoResponse:
        todo = await self._repo.update(id, data.model_dump(exclude_none=True))
        if todo is None:
            raise TodoNotFoundException(id=id)
        await self._session.commit()
        return TodoResponse.model_validate(todo)

    async def delete_todo(self, id: uuid.UUID) -> None:
        deleted = await self._repo.delete(id)
        if not deleted:
            raise TodoNotFoundException(id=id)
        await self._session.commit()
