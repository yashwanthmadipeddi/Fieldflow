FieldFlow — Demo Login UI Patch
================================

This patch adds a recruiter-friendly demo login screen with one-click access to:
- Customer: demo_customer / DemoCustomer123!
- Business Owner: demo_owner / DemoOwner123!
- Field Worker: demo_worker_1 / DemoWorker123!

Files to replace
----------------
1. fieldflow-project/frontend/src/pages/auth/Login.tsx
2. fieldflow-project/frontend/src/styles.css

No database migration is required.

Before using the demo buttons, make sure the backend demo data exists:

    cd backend
    .\venv\Scripts\activate
    python manage.py migrate
    python manage.py seed_demo
    python manage.py runserver

In a second terminal:

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173/login

The patch uses the existing /api/v1/auth/login/ endpoint and existing demo
credentials from the project's seed_demo management command. It does not
change the backend authentication implementation or database schema.

Note: The source package was not modified; this ZIP contains only the two
frontend files that need to be replaced plus these instructions.
