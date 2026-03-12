# CLAUDE.md - To do app Harness Engineering

## Project
Full-stack to-do app. FastAPI backend, React + Typescript frontend, PostgreSQL.

## Architecture Rules
- Backend follows repository -> service -> endpoint layering. Endpoints never import SQLAlchemy Session directly.
- Frontend follows compoent -> hook -> store -> API Client layering. Components never call axios directly.
- All API responses use the envelope: { data, meta, error }

## Coding Standards - Backend (Python)
- Python 3.12, async everywhere, type hints on all functions.
- Ruff for linting (line-length=88), mypy --strict for type checking.
- Google-style docstrings on all public functions.
- Pydantic models for all request/response schemas (no raw dicts).
- All config via pydantic-settings (no hardcoded values).
- Tests with pytest + pytest-asyncio, coverage > 80%.

## Coding Standards - Frontend (Typescript/React)
- Strict Typescript (no `any`, no `as` casts without justification).
- Functional components only, named exports (no default exports except pages)
- Props interface named `<Component>Props` above each component.
- Tailwind CSS only (no inline styles, no CSS modules).
- Custom hooks for all data fetching (no fetch/axios in components).
- Max 150 lines per component file. 
- eslint-plugin-jsx-a11y recommended ruleset.
- Vitest + React Testing Library for tests.

## Anti-Over-Engineering (STRICTLY ENFORCED)
DO NOT add any of the following. If you are tempted, stop and re-read this:
- Authentication/Authorization.
- WebSockets for real-time updates.
- Abstract base clases or generic repositories.
- Redis Caching.
- Internationalization (i18n).
- Rate Limiting.
- GraphQL.
- Custom event bus, CQRS, or saga patterns.
- Any dependency not listed in the PRD tech stack.

## Git conventions
- Conventional commits: feat:, fix:, chore:, docs:, test:.
- One logical change per commit.
- PR must be < 300 meaningful lines (excluding lock files, migrations)
- PR description must follow the What/Why/How/Testing/Checklist template

## Commands
- `make lint` - Run all linters (both backend and frontend)
- `make test` - Run all tests
- `make up` - Start docker-compose
EOF