# Payroll Management System

A multi-tenant payroll management system designed for small and medium-sized businesses to manage workers, attendance, salaries, and payments efficiently.

---

## Features

- Multi-tenant architecture
- Tenant management
- User authentication and authorization
- Role-based access control
- Worker management
- Employee code management
- Attendance management
- Daily wage management
- Weekly wage management
- Monthly salary management
- Payment tracking
- Payroll dashboard
- Payment summary and statistics
- Tenant subscription management
- Free trial and subscription expiry management
- JWT-based authentication

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- MySQL
- JWT Authentication

### Frontend

- React
- Vite
- React Router
- Material UI

### Database

- MySQL


---

## Project Structure

```text
payroll_management/
│
├── backend/
│   ├── app/
│   │   └──api/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
│
├── README.md
└── .gitignore
```

---

## Architecture

The application follows a monolithic backend architecture with a separate frontend application.

The frontend and backend are maintained in the same Git repository but are deployed independently.

```text
                    GitHub Repository
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Frontend                    Backend
          React                       FastAPI
             │                           │
             │                           │
          Vercel                      Render
                                         │
                                         │
                                      Railway
                                       MySQL
```

---

## Getting Started

Follow the instructions below to run the project locally.

### Prerequisites

Make sure the following tools are installed:

- Python 3.x
- Node.js
- npm
- MySQL
- Git

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Create the backend environment file:

```text
backend/.env
```

Configure the required environment variables.

Example:

```env
DATABASE_URL=
JWT_SECRET_KEY=
```

Run the FastAPI application:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the required npm packages:

```bash
npm install
```

Create the frontend environment file:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Environment Variables

Environment variables are required for both the backend and frontend.

### Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=
JWT_SECRET_KEY=
```

The actual production values should never be committed to Git.

Use the following file as a reference:

```text
backend/.env.example
```

### Frontend Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=
```

The actual production values should never be committed to Git.

Use the following file as a reference:

```text
frontend/.env.example
```

---

## API Documentation

The backend is built using FastAPI and provides automatic API documentation.

After starting the backend, the following documentation pages are available:

### Swagger UI

```text
http://127.0.0.1:8000/docs
```

### ReDoc

```text
http://127.0.0.1:8000/redoc
```

---

## Authentication

The application uses JWT-based authentication.

After successful authentication, the backend generates a JWT token that is used to authorize protected API requests.

The application supports role-based access control.

### Roles

- ADMIN
- SUPER_ADMIN

---

## Multi-Tenancy

The application supports multiple tenants using a shared database and shared schema architecture.

Each tenant has its own tenant identifier, and tenant-specific data is isolated using the tenant context.

Tenant-specific operations are performed based on the authenticated user's tenant.

```text
Tenant A
   │
   ├── Users
   ├── Workers
   ├── Attendance
   └── Payments

Tenant B
   │
   ├── Users
   ├── Workers
   ├── Attendance
   └── Payments
```

---

## Payroll Management

The system supports multiple salary/payment types:

- Daily
- Weekly
- Monthly

Workers can be assigned a salary type and salary amount.

The payment management module provides payment tracking and summaries based on the selected payment type.

---

## Attendance Management

The attendance module allows administrators to:

- Record worker attendance
- Update attendance
- View attendance records
- Manage attendance for individual workers
- Manage attendance for multiple workers

Attendance information is associated with the corresponding tenant and worker.

---

## Worker Management

The worker management module allows administrators to:

- Add workers
- Update workers
- View workers
- Delete workers
- Assign salary types
- Assign salary amounts
- Manage employee codes

Supported salary types:

```text
DAILY
WEEKLY
MONTHLY
```

---

## Subscription Management

The application supports tenant subscriptions.

Subscription information includes:

- Subscription type
- Subscription start date
- Subscription end date
- Active/inactive subscription status

The system can support a free trial period and subscription expiry handling.

---

## Database

The application uses MySQL as the database.

The production database is hosted using Railway.

Database configuration should be provided through environment variables.

Do not commit database credentials, passwords, or connection strings to the repository.

---

## Deployment

The application consists of three separately deployed components.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Railway MySQL |

### Frontend

The React frontend is deployed on Vercel.

The frontend communicates with the deployed FastAPI backend using the configured API URL.

### Backend

The FastAPI backend is deployed on Render.

The backend connects to the MySQL database hosted on Railway.

### Database

The production MySQL database is hosted on Railway.

---

## Git Workflow

The project uses Git for version control.

The `main` branch should contain stable and production-ready code.

Development work should be performed using feature or fix branches.

Example:

```text
main
 │
 ├── feature/payment-api
 │
 ├── feature/payment-page
 │
 ├── feature/worker-management
 │
 └── fix/login-api
```

Example workflow:

```bash
git checkout main
git pull origin main

git checkout -b feature/payment-api
```

After completing the changes:

```bash
git add .
git commit -m "feat: add payment detail API"
git push origin feature/payment-api
```

The feature branch can then be reviewed and merged into `main`.

---

## Commit Convention

Use meaningful commit messages.

Examples:

```text
feat: add worker payment detail API
feat: add monthly payment filter
fix: resolve attendance validation issue
fix: correct tenant subscription validation
refactor: improve worker service
ui: improve daily payment page
docs: update project documentation
```

---

## Security

The following information must never be committed to the repository:

- Database passwords
- JWT secrets
- API keys
- Access tokens
- Production credentials
- Private keys
- `.env` files containing real credentials

Use `.env.example` files to document required environment variables.

---

## Development Documentation

Additional documentation is available inside the individual application directories.

### Backend Documentation

See:

```text
backend/README.md
```

The backend README contains backend-specific information such as:

- Backend architecture
- API endpoints
- Database configuration
- Backend development commands
- API implementation details

### Frontend Documentation

See:

```text
frontend/README.md
```

The frontend README contains frontend-specific information such as:

- Frontend architecture
- Pages
- Components
- API integration
- npm commands
- Frontend development information

---

## Production URLs

Add your production URLs below.

### Frontend

```text
https://your-frontend-domain.com
```

### Backend API

```text
https://your-backend-domain.com
```

### API Documentation

```text
https://your-backend-domain.com/docs
```

---

## License

This project is proprietary software.

Unauthorized copying, distribution, modification, or commercial use is not permitted without permission from the project owner.

---

## Author

Developed and maintained as a Payroll Management System project.