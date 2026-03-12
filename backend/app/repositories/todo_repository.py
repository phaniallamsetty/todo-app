import uuid
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo


class TodoRepository:
    """Repository for Todo database operations."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize with an async database session.

        Args:
            session: The SQLAlchemy async session to use for queries.
        """
        self._session = session

    async def get_by_id(self, id: uuid.UUID) -> Todo | None:
        """Fetch a single Todo by primary key.

        Args:
            id: The UUID of the todo to retrieve.

        Returns:
            The Todo instance if found, otherwise None.
        """
        result = await self._session.execute(select(Todo).where(Todo.id == id))
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        completed: bool | None = None,
        priority: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Todo], int]:
        """Fetch a paginated, filtered list of Todos with a total count.

        Args:
            skip: Number of records to skip (offset).
            limit: Maximum number of records to return.
            completed: Filter by completion status when provided.
            priority: Filter by priority level when provided.
            search: Case-insensitive substring match against title and description.

        Returns:
            A tuple of (list of Todo instances, total matching count).
        """
        query = select(Todo)

        if completed is not None:
            query = query.where(Todo.completed == completed)
        if priority is not None:
            query = query.where(Todo.priority == priority)
        if search is not None:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Todo.title.ilike(pattern),
                    Todo.description.ilike(pattern),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total: int = (await self._session.scalar(count_query)) or 0

        rows = await self._session.execute(query.offset(skip).limit(limit))
        todos = list(rows.scalars().all())

        return todos, total

    async def create(self, data: dict[str, Any]) -> Todo:
        """Persist a new Todo record.

        Args:
            data: Mapping of column names to values for the new Todo.

        Returns:
            The newly created Todo instance with server-generated fields populated.
        """
        todo = Todo(**data)
        self._session.add(todo)
        await self._session.flush()
        await self._session.refresh(todo)
        return todo

    async def update(self, id: uuid.UUID, data: dict[str, Any]) -> Todo | None:
        """Update an existing Todo by primary key.

        Args:
            id: The UUID of the todo to update.
            data: Mapping of column names to new values.

        Returns:
            The updated Todo instance, or None if no record was found.
        """
        todo = await self.get_by_id(id)
        if todo is None:
            return None
        for key, value in data.items():
            setattr(todo, key, value)
        await self._session.flush()
        await self._session.refresh(todo)
        return todo

    async def delete(self, id: uuid.UUID) -> bool:
        """Delete a Todo by primary key.

        Args:
            id: The UUID of the todo to delete.

        Returns:
            True if a record was deleted, False if no record was found.
        """
        todo = await self.get_by_id(id)
        if todo is None:
            return False
        await self._session.delete(todo)
        await self._session.flush()
        return True
