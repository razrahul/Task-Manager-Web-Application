from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.crud.task_crud import TaskCRUD
from app.schemas.task_schema import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, task_crud: TaskCRUD | None = None) -> None:
        self.task_crud = task_crud or TaskCRUD()

    def list_tasks(
        self,
        db: Session,
        *,
        search: str | None,
        status_filter: str | None,
        page: int,
        limit: int,
    ) -> dict:
        try:
            total, tasks = self.task_crud.get_tasks(
                db,
                search=search,
                status=status_filter,
                page=page,
                limit=limit,
            )
            return {
                "success": True,
                "message": "Tasks fetched successfully",
                "total": total,
                "page": page,
                "limit": limit,
                "data": tasks,
            }
        except SQLAlchemyError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while fetching tasks",
            ) from exc

    def get_task(self, db: Session, task_id: int):
        try:
            task = self.task_crud.get_task_by_id(db, task_id)
        except SQLAlchemyError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while fetching task",
            ) from exc

        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task

    def create_task(self, db: Session, payload: TaskCreate):
        try:
            return self.task_crud.create_task(db, payload)
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while creating task",
            ) from exc

    def update_task(self, db: Session, task_id: int, payload: TaskUpdate):
        task = self.get_task(db, task_id)
        try:
            return self.task_crud.update_task(db, task, payload)
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while updating task",
            ) from exc

    def delete_task(self, db: Session, task_id: int) -> None:
        task = self.get_task(db, task_id)
        try:
            self.task_crud.delete_task(db, task)
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while deleting task",
            ) from exc


def get_task_service() -> TaskService:
    return TaskService()
