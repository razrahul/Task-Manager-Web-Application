from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.core.database import Base, engine
from app.models import Task  # noqa: F401
from app.routes.task_routes import router as task_router
from app.utils.error_handler import register_exception_handlers


def ensure_task_soft_delete_schema() -> None:
    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("tasks")}
    indexes = {index["name"] for index in inspector.get_indexes("tasks")}

    with engine.begin() as connection:
        if "deleted_at" not in columns:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN deleted_at DATETIME NULL"))

        if "ix_tasks_deleted_at" not in indexes:
            connection.execute(text("CREATE INDEX ix_tasks_deleted_at ON tasks (deleted_at)"))


Base.metadata.create_all(bind=engine)
ensure_task_soft_delete_schema()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(task_router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"message": f"{settings.app_name} is running"}
