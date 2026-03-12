"""Integration tests for the Todo CRUD API endpoints."""

from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import settings
from app.database import get_session
from app.main import app
from app.models.todo import Base, Todo

# ---------------------------------------------------------------------------
# Session-scoped engine with NullPool — connections are created fresh per call,
# which prevents event-loop mismatch errors across test function loops.
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(settings.database_url, poolclass=NullPool, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


# ---------------------------------------------------------------------------
# Per-test client — wipes todos before each test, creates fresh sessions
# per request so no cross-loop connection sharing occurs.
# ---------------------------------------------------------------------------


@pytest.fixture
async def api_client(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    # Clean state before each test
    async with AsyncSession(test_engine, expire_on_commit=False) as session:
        await session.execute(delete(Todo))
        await session.commit()

    # Fresh session per HTTP request keeps connections in the caller's loop
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        async with AsyncSession(test_engine, expire_on_commit=False) as session:
            yield session

    mock_conn = AsyncMock()
    mock_engine = MagicMock()
    mock_engine.connect.return_value = mock_conn
    mock_engine.dispose = AsyncMock()

    app.dependency_overrides[get_session] = override_get_session
    with (
        patch("app.main.engine", mock_engine),
        patch("app.api.v1.endpoints.health.engine", mock_engine),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            yield client

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

BASE = "/api/v1/todos"


def _todo_payload(**overrides: Any) -> dict[str, Any]:
    base: dict[str, Any] = {"title": "Buy milk", "priority": "medium"}
    return {**base, **overrides}


# ---------------------------------------------------------------------------
# POST /todos → 201
# ---------------------------------------------------------------------------


async def test_create_todo_returns_201(api_client: AsyncClient) -> None:
    resp = await api_client.post(BASE, json=_todo_payload(title="Test task"))
    assert resp.status_code == 201
    body = resp.json()
    assert body["data"]["title"] == "Test task"
    assert body["data"]["completed"] is False
    assert body["data"]["priority"] == "medium"
    assert body["data"]["id"] is not None
    assert body["error"] is None
    assert body["meta"]["version"] == settings.app_version


# ---------------------------------------------------------------------------
# GET /todos/{id} → 200
# ---------------------------------------------------------------------------


async def test_get_todo_returns_200(api_client: AsyncClient) -> None:
    created = (await api_client.post(BASE, json=_todo_payload())).json()
    todo_id = created["data"]["id"]

    resp = await api_client.get(f"{BASE}/{todo_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["id"] == todo_id
    assert body["error"] is None


# ---------------------------------------------------------------------------
# GET /todos/{id} with unknown id → 404
# ---------------------------------------------------------------------------


async def test_get_todo_not_found_returns_404(api_client: AsyncClient) -> None:
    resp = await api_client.get(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "TODO_NOT_FOUND"


# ---------------------------------------------------------------------------
# GET /todos → 200 with pagination
# ---------------------------------------------------------------------------


async def test_list_todos_returns_pagination(api_client: AsyncClient) -> None:
    for i in range(3):
        await api_client.post(BASE, json=_todo_payload(title=f"Task {i}"))

    resp = await api_client.get(BASE, params={"page": 1, "page_size": 2})
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["total"] == 3
    assert len(body["data"]["items"]) == 2
    assert body["data"]["total_pages"] == 2
    assert body["data"]["page"] == 1


# ---------------------------------------------------------------------------
# GET /todos?completed=true → filtered results
# ---------------------------------------------------------------------------


async def test_list_todos_filter_completed(api_client: AsyncClient) -> None:
    await api_client.post(BASE, json=_todo_payload(title="Done"))
    created = (await api_client.post(BASE, json=_todo_payload(title="Pending"))).json()
    todo_id = created["data"]["id"]
    await api_client.put(f"{BASE}/{todo_id}", json={"completed": True})

    resp = await api_client.get(BASE, params={"completed": "true"})
    assert resp.status_code == 200
    items = resp.json()["data"]["items"]
    assert all(item["completed"] for item in items)
    assert len(items) == 1


# ---------------------------------------------------------------------------
# GET /todos?priority=high → filtered results
# ---------------------------------------------------------------------------


async def test_list_todos_filter_priority(api_client: AsyncClient) -> None:
    await api_client.post(BASE, json=_todo_payload(title="Low", priority="low"))
    await api_client.post(BASE, json=_todo_payload(title="High", priority="high"))

    resp = await api_client.get(BASE, params={"priority": "high"})
    assert resp.status_code == 200
    items = resp.json()["data"]["items"]
    assert all(item["priority"] == "high" for item in items)
    assert len(items) == 1


# ---------------------------------------------------------------------------
# GET /todos?search=keyword → filtered results
# ---------------------------------------------------------------------------


async def test_list_todos_search(api_client: AsyncClient) -> None:
    await api_client.post(BASE, json=_todo_payload(title="Buy GROCERIES today"))
    await api_client.post(BASE, json=_todo_payload(title="Unrelated task"))

    resp = await api_client.get(BASE, params={"search": "GROCERIES"})
    assert resp.status_code == 200
    items = resp.json()["data"]["items"]
    assert len(items) == 1
    assert "GROCERIES" in items[0]["title"]


# ---------------------------------------------------------------------------
# PUT /todos/{id} → 200 with updated fields
# ---------------------------------------------------------------------------


async def test_update_todo_returns_200(api_client: AsyncClient) -> None:
    created = (await api_client.post(BASE, json=_todo_payload(title="Original"))).json()
    todo_id = created["data"]["id"]

    resp = await api_client.put(
        f"{BASE}/{todo_id}", json={"title": "Updated", "completed": True}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["title"] == "Updated"
    assert body["data"]["completed"] is True
    assert body["error"] is None


# ---------------------------------------------------------------------------
# DELETE /todos/{id} → 204
# ---------------------------------------------------------------------------


async def test_delete_todo_returns_204(api_client: AsyncClient) -> None:
    created = (await api_client.post(BASE, json=_todo_payload())).json()
    todo_id = created["data"]["id"]

    resp = await api_client.delete(f"{BASE}/{todo_id}")
    assert resp.status_code == 204

    get_resp = await api_client.get(f"{BASE}/{todo_id}")
    assert get_resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /todos/{id} with unknown id → 404
# ---------------------------------------------------------------------------


async def test_delete_todo_not_found_returns_404(api_client: AsyncClient) -> None:
    resp = await api_client.delete(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "TODO_NOT_FOUND"
