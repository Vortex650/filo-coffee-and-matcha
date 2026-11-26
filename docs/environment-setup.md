# Environment Setup

## Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Backend (.env)
```
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:pass@host:5432/filo_coffee_db
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

Local dev defaults to SQLite if DATABASE_URL not set.
```

# Deployment Plan

## GitHub
Monorepo `filo-coffee-and-matcha`, branches main/develop/feature/*.

## Vercel (frontend)
- Root directory: frontend
- Build: npm run build
- Output: dist
- Env: VITE_API_BASE_URL

## Render (backend)
- Root: backend
- Start: gunicorn filo_coffee_and_matcha.wsgi:application
- Build: pip install -r requirements.txt && python manage.py migrate
- Env: SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, DATABASE_URL, CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS

## Supabase
- Project filo-coffee-and-matcha, db filo_coffee_db
- Use connection string for DATABASE_URL

## pgAdmin 4
Local inspection via Supabase connection details.
