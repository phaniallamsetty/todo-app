from uuid import UUID


class TodoNotFoundException(Exception):
    """Raised when a Todo cannot be found by its ID."""

    def __init__(self, id: UUID) -> None:
        super().__init__(f"Todo with id {id} not found")
        self.id = id


class TodoValidationException(Exception):
    """Raised when Todo data fails business-level validation."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message
