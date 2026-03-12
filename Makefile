.PHONY: up down logs lint-be test-be test lint migrate

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend

lint-be:
	cd backend && .venv/bin/ruff check . && .venv/bin/ruff format --check .

lint: lint-be

test-be:
	cd backend && .venv/bin/pytest

test: test-be

migrate:
	docker compose exec backend alembic upgrade head
