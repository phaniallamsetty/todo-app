# Todo App

A full-stack task management app built with FastAPI, React + TypeScript, and PostgreSQL. Create, edit, filter, and paginate todos with priority levels (low / medium / high).

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Backend  | Python 3.12, FastAPI, SQLAlchemy (async), Alembic   |
| Frontend | React 18, TypeScript, Zustand, Axios, Vite          |
| Database | PostgreSQL 16                                       |
| Tooling  | Docker, Ruff, mypy, ESLint, Vitest, pytest          |

## Architecture

```
Frontend (React)              Backend (FastAPI)         Database
────────────────              ─────────────────         ────────
Component                     Endpoint (Router)
  └─ Hook (useTodos)    ───►    └─ Service          PostgreSQL
       └─ Store                      └─ Repository
            └─ API Client                 └─ SQLAlchemy Model
```

All API responses use a consistent envelope:

```json
{ "data": { ... }, "meta": { "version": "0.1.0" }, "error": null }
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full technical details.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Node.js](https://nodejs.org/) 20+
- [Python](https://python.org/) 3.12+ _(for local linting and testing)_
- [GitHub CLI](https://cli.github.com/) _(for contributing)_

## Quick Start

```bash
# 1. Clone and enter the repo
git clone <repo-url> && cd todo-app

# 2. Start the database and backend (builds Docker images on first run)
make up

# 3. Run database migrations
make migrate

# 4. Install frontend dependencies and start the dev server
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.
Interactive API docs are available at **http://localhost:8000/docs**.

> The Vite dev server proxies `/api` requests to the backend, so no extra
> environment configuration is needed for local development.

## Make Commands

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `make up`      | Build and start all Docker services (DB + API)    |
| `make down`    | Stop all Docker services                          |
| `make logs`    | Tail backend container logs                       |
| `make migrate` | Run pending Alembic database migrations           |
| `make lint`    | Run all linters (Ruff + ESLint/tsc)               |
| `make lint-be` | Backend only: Ruff check + format check           |
| `make lint-fe` | Frontend only: ESLint + TypeScript typecheck      |
| `make test`    | Run all tests (backend + frontend)                |
| `make test-be` | Backend tests via pytest (with coverage)          |
| `make test-fe` | Frontend tests via Vitest                         |

**Backend local dev setup** (required for `make lint-be` / `make test-be`):

```bash
cd backend
python -m venv .venv
.venv/bin/pip install -e ".[dev]"
```

## Project Structure

```
todo-app/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers — HTTP concerns only
│   │   ├── services/           # Business logic and validation
│   │   ├── repositories/       # All database queries
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── exceptions/         # Domain-specific exception types
│   │   ├── config.py           # App settings (loaded from env vars)
│   │   ├── database.py         # Async SQLAlchemy engine and session
│   │   └── main.py             # App factory, middleware, error handlers
│   ├── alembic/                # Database migration scripts
│   └── tests/                  # pytest test suite
├── frontend/
│   └── src/
│       ├── api/                # Axios client with envelope unwrapping
│       ├── hooks/              # Data-fetching React hooks
│       ├── store/              # Zustand global state (todos, filters, pagination)
│       ├── components/
│       │   ├── todos/          # Todo-specific components (list, item, form, filters)
│       │   ├── ui/             # Reusable primitives (Button, Input, Modal, Pagination)
│       │   └── layout/         # App shell and header
│       └── types/              # Shared TypeScript interfaces
├── docker-compose.yml          # PostgreSQL 16 + FastAPI backend services
└── Makefile                    # Developer workflow commands
```

## Contributing

**Branch naming:** `feat/<description>`, `fix/<description>`, `chore/<description>`, `docs/<description>`

**Before opening a PR:**

1. `make lint` — all linters must pass with zero warnings
2. `make test` — all tests must pass
3. PR description must follow the What / Why / How / Testing / Checklist template
4. Keep PRs under 300 meaningful lines (lock files and migrations excluded)
