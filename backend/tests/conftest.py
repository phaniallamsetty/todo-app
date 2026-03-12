from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


def _make_mock_engine() -> MagicMock:
    """Return a MagicMock that behaves like an AsyncEngine for tests."""
    mock_conn = AsyncMock()
    mock_engine = MagicMock()
    mock_engine.connect.return_value = mock_conn
    mock_engine.dispose = AsyncMock()
    return mock_engine


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with a mocked database engine."""
    mock_engine = _make_mock_engine()
    with (
        patch("app.main.engine", mock_engine),
        patch("app.api.v1.endpoints.health.engine", mock_engine),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac
