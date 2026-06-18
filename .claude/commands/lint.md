Run linters and auto-fix what can be auto-fixed.

Frontend:
```bash
cd frontend && npx next lint --fix
```

Backend (ruff):
```bash
cd backend && python3 -m ruff check . --fix && python3 -m ruff format .
```

After fixing, run `/check` to confirm no residual errors remain.
