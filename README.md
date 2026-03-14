# Task Manager

Task Manager ek full-stack web application hai jo React + Vite frontend aur FastAPI + SQLAlchemy + MySQL backend ke saath build ki gayi hai. Isme tasks create, update, search, filter, paginate aur soft delete kiye ja sakte hain.

## Tech Stack

- Frontend: React 18, Vite, Axios, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: MySQL

## Features

- Task create, read, update aur delete flow
- Soft delete using `deleted_at` timestamp
- Search by title ya description
- Status filter: `pending` / `completed`
- Pagination on task listing
- Dark mode with `localStorage` persistence
- Structured validation and API error responses

## Project Structure

```text
backend/
  app/
    core/
      config.py
      database.py
    crud/
      task_crud.py
    models/
      task_model.py
    routes/
      task_routes.py
    schemas/
      response_schema.py
      task_schema.py
    services/
      task_service.py
    utils/
      error_handler.py
    main.py
  requirements.txt
frontend/
  src/
    components/
    pages/
    services/
    App.jsx
    index.css
    main.jsx
  package.json
render.yaml
netlify.toml
README.md
```

## Backend Setup

1. `backend` folder me jao.
2. Virtual environment banao aur activate karo.
3. Dependencies install karo:

```bash
pip install -r requirements.txt
```

4. `backend/.env` file banao aur ye values set karo:

```env
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=task_manager
DATABASE_URL=
APP_ENV=development
APP_NAME=Task Manager API
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=http://localhost:5173
```

5. Backend server run karo:

```bash
uvicorn app.main:app --reload
```

Backend default URL: `http://localhost:8000`

API base URL: `http://localhost:8000/api/v1`

## Frontend Setup

1. `frontend` folder me jao.
2. Dependencies install karo:

```bash
npm install
```

3. `frontend/.env` file banao:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. Frontend run karo:

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

## API Endpoints

### `GET /api/v1/tasks`

Query params:

- `search`: title ya description ke against search
- `status`: `pending` ya `completed`
- `page`: default `1`
- `limit`: default `10`

Example response:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "total": 12,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "title": "Prepare sprint notes",
      "description": "Summarize blockers and follow-ups",
      "status": "pending",
      "created_at": "2026-03-14T10:00:00"
    }
  ]
}
```

### `GET /api/v1/tasks/{task_id}`

Single active task return karta hai. Agar task soft deleted ho chuka hai to `404 Task not found` aayega.

### `POST /api/v1/tasks`

Example request body:

```json
{
  "title": "Prepare sprint notes",
  "description": "Summarize blockers and follow-ups",
  "status": "pending"
}
```

### `PUT /api/v1/tasks/{task_id}`

Existing active task update karta hai.

### `DELETE /api/v1/tasks/{task_id}`

Task ko hard delete nahi karta. Ye `deleted_at` set karke task ko soft delete karta hai aur `204 No Content` return karta hai.

## Validation Rules

- `title` required hai aur minimum 3 characters hona chahiye
- `description` optional hai aur maximum 500 characters ho sakti hai
- `status` sirf `pending` ya `completed` ho sakta hai

## Notes

- Backend startup par `tasks` table me `deleted_at` column missing ho to app usko add karne ki koshish karti hai.
- Soft deleted tasks list, get aur update flows me visible nahi honge.
- Project me Alembic migrations abhi configured nahi hain.

## Deployment

### Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Required env vars: backend wale same database aur CORS vars

Reference file: [render.yaml](/d:/Project/task%20Maneger/render.yaml)

### Netlify

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- `VITE_API_BASE_URL` ko deployed backend URL par set karo

Reference file: [netlify.toml](/d:/Project/task%20Maneger/netlify.toml)
