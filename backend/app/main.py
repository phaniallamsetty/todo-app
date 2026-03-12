from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.router import router as v1_router
from app.config import settings
from app.database import engine
from app.exceptions.todo_exceptions import (
    TodoNotFoundException,
    TodoValidationException,
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Verify database connectivity on startup."""
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Todo App",
        version=settings.app_version,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(TodoNotFoundException)
    async def todo_not_found_handler(
        request: Request, exc: TodoNotFoundException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={
                "data": None,
                "meta": {"version": settings.app_version},
                "error": {"code": "TODO_NOT_FOUND", "message": str(exc)},
            },
        )

    @app.exception_handler(TodoValidationException)
    async def todo_validation_handler(
        request: Request, exc: TodoValidationException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "data": None,
                "meta": {"version": settings.app_version},
                "error": {"code": "TODO_VALIDATION_ERROR", "message": exc.message},
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "data": None,
                "meta": {"version": settings.app_version},
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                },
            },
        )

    app.include_router(v1_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
