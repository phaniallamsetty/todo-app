from uuid import uuid4

from app.exceptions.todo_exceptions import TodoNotFoundException, TodoValidationException


class TestTodoNotFoundException:
    def test_message_contains_id(self) -> None:
        todo_id = uuid4()
        exc = TodoNotFoundException(id=todo_id)
        assert str(todo_id) in str(exc)

    def test_id_attribute(self) -> None:
        todo_id = uuid4()
        exc = TodoNotFoundException(id=todo_id)
        assert exc.id == todo_id

    def test_is_exception(self) -> None:
        assert isinstance(TodoNotFoundException(id=uuid4()), Exception)


class TestTodoValidationException:
    def test_message_attribute(self) -> None:
        exc = TodoValidationException(message="title is required")
        assert exc.message == "title is required"

    def test_str_contains_message(self) -> None:
        exc = TodoValidationException(message="bad input")
        assert "bad input" in str(exc)

    def test_is_exception(self) -> None:
        assert isinstance(TodoValidationException(message="err"), Exception)
