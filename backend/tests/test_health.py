from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_returns_200(client: AsyncClient) -> None:
    """Health endpoint returns 200 with the expected schema."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["db"] is True
    assert body["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_health_db_down() -> None:
    """Health endpoint returns db=false when the database is unreachable."""
    # Lifespan engine succeeds; health endpoint engine raises.
    lifespan_engine = MagicMock()
    lifespan_engine.connect.return_value = AsyncMock()
    lifespan_engine.dispose = AsyncMock()

    health_engine = MagicMock()
    health_engine.connect.side_effect = Exception("db down")

    with (
        patch("app.main.engine", lifespan_engine),
        patch("app.api.v1.endpoints.health.engine", health_engine),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            response = await ac.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["db"] is False
