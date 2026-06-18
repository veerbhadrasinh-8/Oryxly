Generate and apply a new Alembic migration for any pending SQLAlchemy model changes.

Steps:
1. Generate migration: `cd backend && alembic revision --autogenerate -m "$ARGUMENTS"`
2. Review the generated file in `backend/alembic/versions/` — verify it only touches expected tables
3. Apply: `alembic upgrade head`
4. Confirm: `alembic current`

Never apply a migration without reviewing it first. If `$ARGUMENTS` is empty, ask for a short description of the change.
