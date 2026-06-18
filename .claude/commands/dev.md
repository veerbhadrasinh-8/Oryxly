Start the full MailFlow development stack.

Services and their ports:
- PostgreSQL: 5432 (via Docker)
- Redis: 6379 (via Docker)
- FastAPI backend: http://localhost:8000
- Next.js frontend: http://localhost:3000
- Celery worker: background process
- API docs: http://localhost:8000/docs

Start everything:
```bash
docker compose up -d postgres redis
cd backend && uvicorn app.main:app --reload --port 8000 &
cd backend && celery -A app.workers.celery_app worker --loglevel=info &
cd frontend && npm run dev
```

Or use Docker Compose for the full stack:
```bash
docker compose up
```

Check `.env` files exist at `backend/.env` and `frontend/.env.local` before starting.
