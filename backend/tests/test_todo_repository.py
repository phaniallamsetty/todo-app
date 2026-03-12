"""Repository tests against a real PostgreSQL test database."""

import uuid
from collections.abc import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

from app.config import settings
from app.models.todo import Base, Todo
from app.repositories.todo_repository import TodoRepository


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
async def engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create the schema once for the whole module, then tear it down."""
    test_engine = create_async_engine(settings.database_url, echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield test_engine
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest.fixture
async def db(engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Provide a session that is rolled back after every test."""
    async with AsyncSession(engine, expire_on_commit=False) as session:
        await session.begin()
        yield session
        await session.rollback()


@pytest.fixture
async def repo(db: AsyncSession) -> TodoRepository:
    """Return a TodoRepository bound to the per-test session."""
    return TodoRepository(db)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _make_todo(
    repo: TodoRepository,
    *,
    title: str = "Buy milk",
    description: str | None = None,
    completed: bool = False,
    priority: str = "medium",
) -> Todo:
    return await repo.create(
        {
            "title": title,
            "description": description,
            "completed": completed,
            "priority": priority,
        }
    )


# ---------------------------------------------------------------------------
# create
# ---------------------------------------------------------------------------


async def test_create_returns_todo_with_generated_id(repo: TodoRepository) -> None:
    todo = await _make_todo(repo, title="Test task")
    assert isinstance(todo.id, uuid.UUID)
    assert todo.title == "Test task"
    assert todo.completed is False
    assert todo.priority == "medium"
    assert todo.created_at is not None


async def test_create_with_all_fields(repo: TodoRepository) -> None:
    todo = await _make_todo(
        repo,
        title="Urgent task",
        description="Very important",
        completed=True,
        priority="high",
    )
    assert todo.description == "Very important"
    assert todo.completed is True
    assert todo.priority == "high"


# ---------------------------------------------------------------------------
# get_by_id
# ---------------------------------------------------------------------------


async def test_get_by_id_returns_todo(repo: TodoRepository) -> None:
    created = await _make_todo(repo)
    fetched = await repo.get_by_id(created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.title == created.title


async def test_get_by_id_returns_none_for_missing(repo: TodoRepository) -> None:
    result = await repo.get_by_id(uuid.uuid4())
    assert result is None


# ---------------------------------------------------------------------------
# get_all
# ---------------------------------------------------------------------------


async def test_get_all_returns_all_todos(repo: TodoRepository) -> None:
    await _make_todo(repo, title="Task A")
    await _make_todo(repo, title="Task B")
    todos, total = await repo.get_all()
    assert total >= 2
    assert len(todos) >= 2


async def test_get_all_filter_completed(repo: TodoRepository) -> None:
    await _make_todo(repo, title="Done", completed=True)
    await _make_todo(repo, title="Not done", completed=False)
    done_todos, done_count = await repo.get_all(completed=True)
    pending_todos, pending_count = await repo.get_all(completed=False)
    assert all(t.completed for t in done_todos)
    assert all(not t.completed for t in pending_todos)
    assert done_count >= 1
    assert pending_count >= 1


async def test_get_all_filter_priority(repo: TodoRepository) -> None:
    await _make_todo(repo, title="High prio", priority="high")
    await _make_todo(repo, title="Low prio", priority="low")
    high_todos, high_count = await repo.get_all(priority="high")
    assert all(t.priority == "high" for t in high_todos)
    assert high_count >= 1


async def test_get_all_search_by_title(repo: TodoRepository) -> None:
    await _make_todo(repo, title="Unique XYZ title")
    todos, total = await repo.get_all(search="XYZ")
    assert total >= 1
    assert any("XYZ" in t.title for t in todos)


async def test_get_all_search_by_description(repo: TodoRepository) -> None:
    await _make_todo(repo, title="Ordinary", description="Contains QWERTY term")
    todos, total = await repo.get_all(search="QWERTY")
    assert total >= 1
    assert any(t.description and "QWERTY" in t.description for t in todos)


async def test_get_all_pagination(repo: TodoRepository) -> None:
    for i in range(5):
        await _make_todo(repo, title=f"Paginate {i}")
    first_page, total = await repo.get_all(skip=0, limit=2)
    assert len(first_page) == 2
    assert total >= 5


async def test_get_all_search_no_match(repo: TodoRepository) -> None:
    todos, total = await repo.get_all(search="ZZZNOMATCH999")
    assert total == 0
    assert todos == []


# ---------------------------------------------------------------------------
# update
# ---------------------------------------------------------------------------


async def test_update_modifies_fields(repo: TodoRepository) -> None:
    todo = await _make_todo(repo, title="Old title")
    updated = await repo.update(todo.id, {"title": "New title", "completed": True})
    assert updated is not None
    assert updated.id == todo.id
    assert updated.title == "New title"
    assert updated.completed is True


async def test_update_returns_none_for_missing(repo: TodoRepository) -> None:
    result = await repo.update(uuid.uuid4(), {"title": "Ghost"})
    assert result is None


# ---------------------------------------------------------------------------
# delete
# ---------------------------------------------------------------------------


async def test_delete_removes_todo(repo: TodoRepository) -> None:
    todo = await _make_todo(repo, title="To delete")
    deleted = await repo.delete(todo.id)
    assert deleted is True
    assert await repo.get_by_id(todo.id) is None


async def test_delete_returns_false_for_missing(repo: TodoRepository) -> None:
    result = await repo.delete(uuid.uuid4())
    assert result is False
