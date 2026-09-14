# FieldFlow API

Django REST Framework backend for the FieldFlow service and workforce management platform.

## Local setup

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

The local app uses SQLite unless `DATABASE_URL` is set. For Neon/PostgreSQL, set `DATABASE_URL` in `.env` and run migrations against that database.

## Demo accounts

Created by `python manage.py seed_demo`:

- Owner: `demo_owner` / `DemoOwner123!`
- Worker: `demo_worker_1` / `DemoWorker123!`
- Customer: `demo_customer` / `DemoCustomer123!`

Change these credentials before any public demonstration that uses the demo database.
