# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing team tasks with **role-based access control**.  
Built with React + Node.js + Express + SQLite. Deployed on Railway.

🔗 **Live URL:** https://assignment-full-stag-production.up.railway.app  
📦 **GitHub:** https://github.com/harishukla2022-cell/assignment-full-stag

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | SQLite (sql.js — zero install) |
| Auth | JWT (JSON Web Tokens) |
| Styling | Vanilla CSS (dark premium UI) |
| Deployment | Railway (Nixpacks) |

---

## ✨ Features

- 🔐 **Authentication** — Signup & Login with JWT tokens (7-day expiry)
- 👑 **Role-Based Access** — Admin (full control) vs Member (view + update status only)
- 📊 **Dashboard** — Live stats: total projects, tasks, completed, overdue count
- 📁 **Projects** — Create, view, update, delete projects (Admin only)
- 👥 **Team Members** — Add/remove members per project (Admin only)
- ✅ **Task Management** — Create tasks with title, priority, due date, assignee
- 🎯 **Kanban Statuses** — Todo → In Progress → Done
- 🔴 **Overdue Detection** — Tasks past due date highlighted automatically

---

## 🔒 Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create / delete projects | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Update any task | ✅ | ❌ |
| Update status of own assigned task | ✅ | ✅ |
| View assigned projects & tasks | ✅ | ✅ |

---

## 🗄️ Database Schema

```
users           — id, name, email, password, role, created_at
projects        — id, name, description, owner_id, created_at
project_members — project_id, user_id (many-to-many join)
tasks           — id, title, description, status, priority, due_date,
                  project_id, assignee_id, created_by, created_at
```

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/projects` | ✅ | List all visible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | ✅ | Project + members + tasks |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |
| GET | `/api/tasks` | ✅ | List tasks (filtered by role) |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/users` | ✅ | List all users |

---

## 🚀 How to Run Locally

**Requirements:** Node.js v18+

```bash
# 1. Clone the repo
git clone https://github.com/harishukla2022-cell/assignment-full-stag.git
cd assignment-full-stag

# 2. Start Backend (Terminal 1)
cd backend
npm install
npm run dev
# → Runs on http://localhost:5000

# 3. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# → Runs on http://localhost:5173

# 4. Open http://localhost:5173
```

---

## ⚙️ Environment Variables

Create `backend/.env`:
```
PORT=5000
JWT_SECRET=your_secret_key_here
```

---

## ☁️ Deployment (Railway)

This app is deployed as a **single Railway service**:
- Railway uses `nixpacks.toml` to build frontend and install backend deps
- Express serves the React build in production (`NODE_ENV=production`)
- Environment variables set in Railway dashboard: `JWT_SECRET`, `NODE_ENV`
