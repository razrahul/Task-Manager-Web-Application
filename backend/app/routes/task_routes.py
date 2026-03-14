from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task_schema import PaginatedTaskResponse, TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import TaskService, get_task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


DbSession = Annotated[Session, Depends(get_db)]
TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]


@router.get("", response_model=PaginatedTaskResponse)
def get_tasks(
    db: DbSession,
    task_service: TaskServiceDep,
    search: str | None = Query(default=None, min_length=1, max_length=255),
    status_filter: Literal["pending", "completed"] | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    return task_service.list_tasks(
        db,
        search=search,
        status_filter=status_filter,
        page=page,
        limit=limit,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: DbSession, task_service: TaskServiceDep):
    task = task_service.get_task(db, task_id)
    return {"success": True, "message": "Task fetched successfully", "data": task}


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: DbSession, task_service: TaskServiceDep):
    task = task_service.create_task(db, payload)
    return {"success": True, "message": "Task created successfully", "data": task}


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: DbSession, task_service: TaskServiceDep):
    task = task_service.update_task(db, task_id, payload)
    return {"success": True, "message": "Task updated successfully", "data": task}


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: DbSession, task_service: TaskServiceDep):
    task_service.delete_task(db, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
