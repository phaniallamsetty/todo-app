import pytest

from app.config import Settings


def test_settings_load_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Settings fields are overridden by environment variables."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@host/testdb")
    monkeypatch.setenv("APP_VERSION", "9.9.9")
    s = Settings()
    assert s.database_url == "postgresql+asyncpg://u:p@host/testdb"
    assert s.app_version == "9.9.9"


def test_settings_defaults() -> None:
    """Settings have sensible defaults."""
    s = Settings()
    assert s.api_v1_prefix == "/api/v1"
    assert s.app_version == "0.1.0"
    assert isinstance(s.database_url, str)
    assert isinstance(s.cors_origins, list)
