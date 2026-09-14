# FieldFlow

**FieldFlow — Service & Workforce Management Platform**

A production-oriented Python full-stack application that coordinates customers, business owners, and field workers across a complete service lifecycle.

## Why this project exists

FieldFlow is intentionally **non-AI**. It is designed to prove practical full-stack engineering skills:

- role-based authentication and authorization
- Django REST API design
- relational PostgreSQL modeling
- workflow/state management
- scheduling and assignment rules
- business validation and transactions
- React role-specific dashboards
- search/filter-ready API design
- notifications and audit history
- automated testing foundations
- deployment and environment management

## Core workflow

```text
Customer request
      ↓
Owner review
      ↓
Worker assignment
      ↓
Worker acceptance
      ↓
Scheduling
      ↓
Work in progress
      ↓
Completion
      ↓
Customer verification
      ↓
Invoice / closeout
```

## Roles

### Customer

- browse active services
- submit service requests
- track request status
- verify completed work

### Worker

- maintain skills
- view assigned work
- accept/start/complete jobs
- keep status transitions explicit

### Owner / Manager

- create services
- monitor demand
- assign workers
- review workflow history
- issue invoices

## Technology

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide icons
- Responsive CSS

### Backend

- Python
- Django 5.2
- Django REST Framework
- Simple JWT
- PostgreSQL / Neon
- SQLite fallback for local development

### Deployment

- GitHub
- Vercel Services for frontend + Django backend
- Neon PostgreSQL for production persistence

## Data model

```text
User
 ├── Owner / Worker / Customer
Service
ServiceRequest
Assignment
StatusHistory
WorkerSkill
WorkAttachment (URL-based proof metadata)
Invoice
InvoiceItem
Notification
```

## Local development

Open two terminals.

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production Neon setup

1. Create a Neon PostgreSQL database/branch.
2. Copy the PostgreSQL connection string into `DATABASE_URL` in `backend/.env` for local migration work.
3. Run:

```powershell
cd backend
python manage.py migrate
```

4. Add the same `DATABASE_URL` as a **Production Environment Variable** in Vercel.
5. Set `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, and `CORS_ALLOWED_ORIGINS`.
6. Redeploy.

Never commit `.env` or a database connection string.

## Vercel deployment

The root `vercel.json` explicitly configures two services:

- `frontend/` → Vite
- `backend/` → Django

The frontend calls `/api/v1/...`, so production does not need a hard-coded backend hostname.

Before the first production request, **run Django migrations against the production Neon database**. Vercel deployment does not automatically create your PostgreSQL schema.

## Engineering decisions

### No AI by design

FieldFlow is deliberately the non-AI proof project in the portfolio. Its complexity comes from authorization, business rules, state transitions, relational modeling, transactions, and operational workflows.

### No serverless local file storage

Job proof is stored as a URL (`proof_url`) rather than depending on an ephemeral serverless filesystem. This keeps the first deployment portable. Object storage can be added later without changing the core workflow model.

### Backend-enforced permissions

The API does not rely on hidden React buttons for authorization. Django permissions and querysets enforce which records each role can access.

## Interview talking points

- Why model status transitions explicitly instead of allowing arbitrary updates?
- How do you prevent cross-user object access?
- How would you optimize dashboard queries at scale?
- Why PostgreSQL instead of a document database?
- How would you move proof media to object storage?
- How would you add background email notifications with Celery?
- How would you design concurrent worker scheduling?

## Project structure

```text
fieldflow/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── services/
│   │   ├── workorders/
│   │   └── notifications/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
├── vercel.json
└── README.md
```
