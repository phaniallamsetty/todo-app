from fastapi import APIRouter

from app.api.v1.endpoints import health, todos

router = APIRouter()
router.include_router(health.router)
router.include_router(todos.router)
