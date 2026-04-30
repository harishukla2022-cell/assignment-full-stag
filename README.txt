Team Task Manager
=================

A full-stack web application for managing team tasks with role-based access control.

GitHub Repository: https://github.com/harishukla2022-cell/assignment-full-stag

---

TECH STACK
----------
- Frontend  : React 18 + Vite
- Backend   : Node.js + Express
- Database  : SQLite (sql.js — zero install)
- Auth      : JWT (JSON Web Tokens)
- Styling   : Vanilla CSS (dark premium UI)

---

KEY FEATURES
------------
1. Authentication     — Signup/Login with JWT tokens
2. Role-Based Access  — Admin (full control) vs Member (view/update status)
3. Dashboard          — Stats: total projects, tasks, completed, overdue
4. Projects           — Create, view, delete projects (Admin only)
5. Team Members       — Add/remove members per project (Admin only)
6. Task Management    — Create tasks with title, priority, due date, assignee
7. Kanban Board       — Todo / In Progress / Done columns
8. Overdue Detection  — Tasks past due date highlighted in red

---

ROLE PERMISSIONS
----------------
Admin:
  - Create/delete projects
  - Add/remove team members
  - Create/delete tasks
  - Update any task

Member:
  - View assigned projects
  - Update status of their assigned tasks

---

DATABASE TABLES (SQL)
---------------------
users            — id, name, email, password, role, created_at
projects         — id, name, description, owner_id, created_at
project_members  — project_id, user_id (many-to-many)
tasks            — id, title, description, status, priority, due_date,
                   project_id, assignee_id, created_by, created_at

---

API ENDPOINTS
-------------
POST   /api/auth/signup              Register new user
POST   /api/auth/login               Login, get JWT token
GET    /api/auth/me                  Get current user

GET    /api/projects                 List all visible projects
POST   /api/projects                 Create project (Admin)
GET    /api/projects/:id             Project details + members + tasks
PUT    /api/projects/:id             Update project (Admin)
DELETE /api/projects/:id             Delete project (Admin)
POST   /api/projects/:id/members     Add member (Admin)
DELETE /api/projects/:id/members/:uid Remove member (Admin)

GET    /api/tasks                    List tasks (with filters)
POST   /api/tasks                    Create task (Admin)
PUT    /api/tasks/:id                Update task
DELETE /api/tasks/:id                Delete task (Admin)

GET    /api/users                    List all users

---

HOW TO RUN LOCALLY
------------------
Requirements: Node.js v18+

1. Clone the repo:
   git clone https://github.com/harishukla2022-cell/assignment-full-stag.git

2. Start Backend:
   cd backend
   npm install
   npm run dev
   --> Runs on http://localhost:5000

3. Start Frontend (new terminal):
   cd frontend
   npm install
   npm run dev
   --> Runs on http://localhost:5173

4. Open http://localhost:5173 in your browser

---

ENVIRONMENT VARIABLES
---------------------
Create backend/.env:
   PORT=5000
   JWT_SECRET=your_secret_key_here

---

DEPLOYMENT
----------
Deployed on Railway.app
Live URL: (see submission form)

---

SUBMISSION
----------
- Live URL      : (Railway deployment URL)
- GitHub Repo   : https://github.com/harishukla2022-cell/assignment-full-stag
- Timeline      : Built in 1-2 days
