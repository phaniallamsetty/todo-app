from datetime import datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.todo import TodoCreate, TodoListResponse, TodoResponse, TodoUpdate


class TestTodoCreate:
    def test_valid_minimal(self) -> None:
        todo = TodoCreate(title="Buy milk")
        assert todo.title == "Buy milk"
        assert todo.description is None
        assert todo.priority == "medium"

    def test_valid_full(self) -> None:
        todo = TodoCreate(title="Buy milk", description="2% please", priority="high")
        assert todo.priority == "high"

    def test_title_too_short(self) -> None:
        with pytest.raises(ValidationError):
            TodoCreate(title="")

    def test_title_too_long(self) -> None:
        with pytest.raises(ValidationError):
            TodoCreate(title="x" * 201)

    def test_invalid_priority(self) -> None:
        with pytest.raises(ValidationError):
            TodoCreate.model_validate({"title": "Task", "priority": "urgent"})

    def test_title_exactly_200(self) -> None:
        todo = TodoCreate(title="x" * 200)
        assert len(todo.title) == 200


class TestTodoUpdate:
    def test_all_none(self) -> None:
        update = TodoUpdate()
        assert update.title is None
        assert update.completed is None
        assert update.priority is None

    def test_partial_completed(self) -> None:
        update = TodoUpdate(completed=True)
        assert update.completed is True
        assert update.title is None

    def test_partial_priority(self) -> None:
        update = TodoUpdate(priority="low")
        assert update.priority == "low"

    def test_title_too_short(self) -> None:
        with pytest.raises(ValidationError):
            TodoUpdate(title="")

    def test_invalid_priority(self) -> None:
        with pytest.raises(ValidationError):
            TodoUpdate.model_validate({"priority": "critical"})


class TestTodoResponse:
    def test_from_dict(self) -> None:
        todo_id = uuid4()
        now = datetime.now()
        resp = TodoResponse.model_validate(
            {
                "id": todo_id,
                "title": "Task",
                "description": None,
                "priority": "low",
                "completed": False,
                "created_at": now,
                "updated_at": None,
            }
        )
        assert resp.id == todo_id
        assert resp.completed is False
        assert resp.updated_at is None

    def test_from_attributes(self) -> None:
        todo_id = uuid4()
        now = datetime.now()

        class FakeOrm:
            id = todo_id
            title = "Task"
            description = None
            priority = "medium"
            completed = True
            created_at = now
            updated_at = None

        resp = TodoResponse.model_validate(FakeOrm())
        assert resp.id == todo_id
        assert resp.completed is True


class TestTodoListResponse:
    def test_valid(self) -> None:
        item = TodoResponse.model_validate(
            {
                "id": uuid4(),
                "title": "Task",
                "priority": "medium",
                "completed": False,
                "created_at": datetime.now(),
            }
        )
        listing = TodoListResponse(
            items=[item], total=1, page=1, page_size=20, total_pages=1
        )
        assert listing.total == 1
        assert len(listing.items) == 1
        assert listing.total_pages == 1

    def test_empty_list(self) -> None:
        listing = TodoListResponse(
            items=[], total=0, page=1, page_size=20, total_pages=0
        )
        assert listing.items == []
