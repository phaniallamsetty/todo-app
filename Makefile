.PHONY: up down logs lint-be test-be migrate

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend

lint-be:
	cd backend && ruff check . && ruff format --check .

test-be:
	cd backend && pytest

migrate:
	docker compose exec backend alembic upgrade head
