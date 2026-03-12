from pydantic import BaseModel


class Meta(BaseModel):
    version: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class Envelope[T](BaseModel):
    data: T | None = None
    meta: Meta
    error: ErrorDetail | None = None
