from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.task_model import Task
from app.schemas.task_schema import TaskCreate, TaskUpdate


class TaskCRUD:
    def get_tasks(
        self,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        page: int = 1,
        limit: int = 10,
    ) -> tuple[int, list[Task]]:
        filters = [Task.deleted_at.is_(None)]
        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(Task.title.ilike(search_term), Task.description.ilike(search_term))
            )
        if status:
            filters.append(Task.status == status)

        base_query = select(Task).where(*filters)
        count_query = select(func.count(Task.id)).where(*filters)

        base_query = base_query.order_by(Task.created_at.desc())
        base_query = base_query.offset((page - 1) * limit).limit(limit)

        total = db.scalar(count_query) or 0
        tasks = db.scalars(base_query).all()
        return total, list(tasks)

    def get_task_by_id(self, db: Session, task_id: int) -> Task | None:
        query = select(Task).where(Task.id == task_id, Task.deleted_at.is_(None))
        return db.scalar(query)

    def create_task(self, db: Session, payload: TaskCreate) -> Task:
        task = Task(**payload.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def update_task(self, db: Session, task: Task, payload: TaskUpdate) -> Task:
        for field, value in payload.model_dump().items():
            setattr(task, field, value)
        db.commit()
        db.refresh(task)
        return task

    def delete_task(self, db: Session, task: Task) -> None:
        task.deleted_at = datetime.now(timezone.utc)
        db.commit()
