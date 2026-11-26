# Folder Structure

```
filo-coffee-and-matcha/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── brand/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   ├── staff/
│   │   │   └── admin/
│   │   ├── features/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── routes/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── config/ (settings split)
│   ├── apps/
│   │   ├── core/
│   │   ├── accounts/
│   │   ├── menu/
│   │   ├── orders/
│   │   └── payments/
│   ├── requirements.txt
│   ├── manage.py
│   └── Dockerfile
├── docs/
├── .gitignore
├── README.md
└── docker-compose.yml
```
```

Note: backend uses `filo_coffee_and_matcha` package as project config currently; will rename to `config` during refactor.
