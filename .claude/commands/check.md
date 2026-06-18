Run all quality checks that must pass before every commit: TypeScript, ESLint, and Python type checking.

```bash
cd frontend && npx tsc --noEmit && npx next lint && cd ../backend && python3 -m mypy app --ignore-missing-imports
```

Fix every failure before marking work done. Do not commit with type errors or lint warnings.
