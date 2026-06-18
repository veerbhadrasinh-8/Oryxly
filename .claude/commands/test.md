Run the full test suite for backend and frontend.

```bash
cd backend && python3 -m pytest -v
cd ../frontend && npx tsc --noEmit
```

If $ARGUMENTS is provided, pass it as a pytest filter: `pytest -v -k "$ARGUMENTS"` to run matching tests only.

All tests must pass before any commit. If tests are missing for a new feature, write them.
