.PHONY: up down logs lint-be lint-fe test-be test-fe test lint migrate

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend

lint-be:
	cd backend && .venv/bin/ruff check . && .venv/bin/ruff format --check .

lint-fe:
	cd frontend && npm run lint

lint: lint-be lint-fe

test-be:
	cd backend && .venv/bin/pytest

test-fe:
	cd frontend && npm test

test: test-be test-fe

migrate:
	docker compose exec backend alembic upgrade head
