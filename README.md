# Filo Coffee and Matcha

Premium café website and ordering management platform.

## Structure
- `frontend/` — React 19 + Vite + TypeScript
- `backend/` — Django + DRF
- `docs/` — planning docs

## Backend setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_phase1
python manage.py createsuperuser
python manage.py runserver
```

## Frontend setup
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

See `docs/` for architecture, schema, deployment.
