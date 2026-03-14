from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TaskStatus = Literal["pending", "completed"]


class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    status: TaskStatus = "pending"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    status: TaskStatus


class TaskListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    created_at: datetime


class TaskResponse(BaseModel):
    success: bool = True
    message: str
    data: TaskListItem


class PaginatedTaskResponse(BaseModel):
    success: bool = True
    message: str
    total: int
    page: int
    limit: int
    data: list[TaskListItem]
