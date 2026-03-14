# Architecture

## Backend Layering

Requests flow strictly top-to-bottom. No layer may import from a layer above it.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  Endpoint  (app/api/v1/endpoints/)                  │
│  • Parses HTTP params / request body (Pydantic)     │
│  • Calls one service method                         │
│  • Wraps result in Envelope and returns it          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Service  (app/services/)                           │
│  • Owns business logic and validation               │
│  • Raises domain exceptions (TodoNotFoundException) │
│  • Commits the transaction after mutations          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Repository  (app/repositories/)                    │
│  • All SQLAlchemy queries live here                 │
│  • flush() after writes; refresh() to reload fields │
│  • Returns ORM model instances or None              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Model  (app/models/)                               │
│  • SQLAlchemy ORM table definitions                 │
│  • No methods — pure data mapping                   │
└─────────────────────────────────────────────────────┘
```

The `AsyncSession` is created per-request via FastAPI's dependency injection
(`get_session` in `database.py`) and is never imported directly in endpoints.

## Frontend Layering

Data flows from the API client up through the store and hook to the component.
No layer reaches past its immediate neighbour.

```
┌─────────────────────────────────────────────────────┐
│  Component  (src/components/)                       │
│  • Renders UI, handles user events                  │
│  • Reads state from the store via useTodoStore      │
│  • Triggers fetches by calling hook actions         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Hook  (src/hooks/useTodos.ts)                      │
│  • Fetches data on mount and when store params change│
│  • Writes results into the store via setTodos       │
│  • Exposes isLoading / error / refetch              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Store  (src/store/todoStore.ts)                    │
│  • Zustand store holding todos, page, and filters   │
│  • setFilters resets page to 1 automatically        │
│  • Optimistic updates for add / update / remove     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  API Client  (src/api/todoApi.ts)                   │
│  • Axios instance; baseURL = Vite proxy /api/v1     │
│  • unwrap() extracts data from Envelope or throws   │
│  • No component or store imports allowed here       │
└─────────────────────────────────────────────────────┘
```

## Database Schema

**Table: `todos`**

| Column       | Type                         | Nullable | Default              | Description                      |
| ------------ | ---------------------------- | -------- | -------------------- | -------------------------------- |
| `id`         | `uuid`                       | NO       | `uuid_generate_v4()` | Primary key                      |
| `title`      | `varchar(200)`               | NO       | —                    | Short summary (1–200 chars)      |
| `description`| `text`                       | YES      | —                    | Optional longer detail           |
| `completed`  | `boolean`                    | NO       | `false`              | Completion status                |
| `priority`   | `priority_enum`              | NO       | `'medium'`           | One of: `low`, `medium`, `high`  |
| `created_at` | `timestamptz`                | NO       | `now()`              | Set on insert by the DB          |
| `updated_at` | `timestamptz`                | YES      | —                    | Set on update by SQLAlchemy      |

Migration: `backend/alembic/versions/a1b2c3d4e5f6_create_todos_table.py`

## API Endpoints

All routes are under the prefix `/api/v1`. Responses use the envelope schema:
`{ "data": T | null, "meta": { "version": string }, "error": { "code": string, "message": string } | null }`

### Health

| Method | Path      | Description                              |
| ------ | --------- | ---------------------------------------- |
| GET    | `/health` | Returns API status and DB connectivity   |

**Response `data`:**
```json
{ "status": "ok", "db": true, "version": "0.1.0" }
```

### Todos

| Method | Path              | Status | Description                     |
| ------ | ----------------- | ------ | ------------------------------- |
| GET    | `/todos`          | 200    | Paginated, filtered list        |
| POST   | `/todos`          | 201    | Create a new todo               |
| GET    | `/todos/{id}`     | 200    | Fetch a single todo             |
| PUT    | `/todos/{id}`     | 200    | Replace todo fields (partial OK)|
| DELETE | `/todos/{id}`     | 204    | Delete a todo (no body)         |

**GET `/todos` query parameters:**

| Parameter   | Type            | Default | Description                                 |
| ----------- | --------------- | ------- | ------------------------------------------- |
| `page`      | integer (≥ 1)   | `1`     | Page number                                 |
| `page_size` | integer (1–100) | `20`    | Items per page                              |
| `completed` | boolean         | —       | Filter by completion status                 |
| `priority`  | string          | —       | Filter by `low`, `medium`, or `high`        |
| `search`    | string          | —       | Case-insensitive substring match on title/description |

**Todo object schema:**

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "completed": false,
  "priority": "medium",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z | null"
}
```

**POST / PUT request body:**

```json
{
  "title": "string (required for POST, optional for PUT)",
  "description": "string | null",
  "priority": "low | medium | high"
}
```

**Error codes:**

| Code                   | HTTP | Meaning                         |
| ---------------------- | ---- | ------------------------------- |
| `TODO_NOT_FOUND`       | 404  | No todo with the given UUID     |
| `TODO_VALIDATION_ERROR`| 422  | Business logic validation failed|
| `INTERNAL_ERROR`       | 500  | Unexpected server error         |
