# Team Task Manager

A full-stack web app for managing team tasks with role-based access control.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (sql.js)
- **Auth:** JWT

## Features
- ✅ Signup / Login with Admin & Member roles
- ✅ Dashboard with task statistics
- ✅ Create and manage projects
- ✅ Add/remove team members
- ✅ Create & assign tasks with priority and due dates
- ✅ Kanban board (Todo → In Progress → Done)
- ✅ Role-based access control

## How to Run Locally

### 1. Clone the repo
```bash
git clone <your-repo-url>
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at: http://localhost:5000

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## Environment Variables

Create a `backend/.env` file:
```
PORT=5000
JWT_SECRET=your_secret_key_here
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project (Admin) |
| POST | /api/tasks | Create task (Admin) |
| PUT | /api/tasks/:id | Update task |
