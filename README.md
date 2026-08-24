# Task Management Dashboard

A full-stack task management dashboard with authentication, role-based
access control (Admin / Employee), a real REST API, TanStack Query-driven
server state, a TanStack Table task list with search/filter/sort/pagination,
and an automatic activity log.

Built as a technical assessment project — no mock/frontend-only CRUD;
the Express API is real, persists to disk, and enforces permissions
server-side (not just by hiding buttons in the UI).

---


Live Demo: https://task-dashboard-ui-nine.vercel.app
GitHub: https://github.com/monu655/task-dashboard

Demo Login: [admin@example.com](mailto:admin@example.com) / admin123

## 1. Project Overview

Admins can create, edit, delete, and assign tasks to employees. Employees
can see only the tasks assigned to them and can change a task's status
(To Do / In Progress / Completed). Every meaningful action — creating,
editing, assigning, deleting, or changing a task's status — is recorded
in a human-readable Activity Log.

## 2. Features

- Email/password login (mock users, JWT-based session)
- Protected routes — unauthenticated users are redirected to `/login`
- Role-based access control enforced **both** in the UI and on the API
- Dashboard with 4 live summary cards (Total, To Do, In Progress, Completed)
  that update automatically whenever task data changes
- Task table (TanStack Table) with:
  - Search by title/description
  - Status filter, Priority filter
  - Sorting by due date
  - Pagination
  - Loading, error, and empty states
- Full task CRUD for admins; status-only updates for employees
- Confirmation dialog before deleting a task
- Toast notifications for every mutation
- Automatic activity logging with human-readable messages
- Fully responsive (desktop / tablet / mobile), with a mobile nav drawer

## 3. Tech Stack

**Frontend:** React 18, Vite, JavaScript, React Router DOM, Tailwind CSS,
TanStack Table, TanStack Query, Axios, Lucide React, react-hot-toast

**Backend:** Node.js, Express.js, JWT (jsonwebtoken), JSON-file persistence

> **Why a JSON file instead of SQLite?** It keeps the project runnable
> anywhere with zero native build steps while still giving real,
> durable persistence across server restarts (unlike an in-memory
> array). The entire data-access layer lives in `server/src/db.js`, so
> swapping in SQLite/Prisma later only means rewriting that one file —
> nothing in the routes would need to change.

## 4. Folder Structure

```
task-dashboard/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios instance + one file per resource
│   │   ├── components/
│   │   │   ├── Layout/            # Sidebar, Header, DashboardLayout, ProtectedRoute
│   │   │   ├── Dashboard/         # SummaryCards
│   │   │   ├── Tasks/             # TaskTable, TaskFormModal, DeleteConfirmModal, badges
│   │   │   └── Common/            # Skeleton, EmptyState
│   │   ├── context/                # AuthContext
│   │   ├── hooks/                  # useTasks, useUsers, useActivities
│   │   ├── pages/                  # Login, Dashboard, Tasks, Activity
│   │   ├── utils/                  # constants (statuses, priorities, styles)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── server/                         # Express backend
│   ├── src/
│   │   ├── routes/                 # auth, tasks, users, activities
│   │   ├── middleware/             # auth (JWT), roles (RBAC)
│   │   ├── utils/                  # activityLogger
│   │   ├── data/db.json            # auto-created & seeded on first run
│   │   ├── db.js                   # data access layer
│   │   └── index.js                # app entry point
│   └── package.json
└── README.md
```

## 5. Installation Instructions

Requires Node.js 18+.

```bash
# from the project root
cd server && npm install
cd ../client && npm install
```

## 6. Environment Variables

**`server/.env`** (already included with sane defaults):
```
PORT=4000
JWT_SECRET=task-dashboard-super-secret-change-in-production
CLIENT_ORIGIN=http://localhost:5173
```

**`client/.env`** (already included):
```
VITE_API_URL=http://localhost:4000
```

## 7. How to Run the Backend

```bash
cd server
npm install
npm run dev      # auto-restarts on file changes, or `npm start`
```
The API starts on `http://localhost:4000`. On first run it creates and
seeds `server/src/data/db.json` with the demo users, tasks, and activity
entries described below.

## 8. How to Run the Frontend

```bash
cd client
npm install
npm run dev
```
The app starts on `http://localhost:5173` and expects the API to be
running on the URL in `VITE_API_URL`.

## 9. Demo Login Credentials

| Role     | Name  | Email                                      | Password      |
|----------|-------|---------------------------------------------|---------------|
| Admin    | Admin | admin@example.com                          | admin123      |
| Employee | Rahul | rahul@example.com                          | employee123   |
| Employee | Priya | priya@example.com                          | employee123   |

The login page has one-click buttons that fill these in for you.

## 10. API Endpoint Documentation

All endpoints except `POST /auth/login` require an
`Authorization: Bearer <token>` header.

| Method | Endpoint         | Access           | Description |
|--------|------------------|------------------|-------------|
| POST   | `/auth/login`    | Public           | `{ email, password }` → `{ token, user }` |
| GET    | `/auth/me`       | Authenticated    | Returns the current user |
| GET    | `/tasks`         | Authenticated    | Admin: all tasks. Employee: only tasks assigned to them |
| GET    | `/tasks/:id`     | Authenticated    | 403 if an employee requests a task not assigned to them |
| POST   | `/tasks`         | Admin only       | Create a task (validates all required fields) |
| PUT/PATCH | `/tasks/:id`  | Authenticated    | Admin: edit any field. Employee: **status only**, and only on their own tasks (403 otherwise) |
| DELETE | `/tasks/:id`     | Admin only       | Deletes the task, logs the deletion |
| GET    | `/users`         | Authenticated    | List of users (passwords stripped) |
| GET    | `/activities`    | Authenticated    | Admin: all activity. Employee: activity relevant to them |
| POST   | `/activities`    | Authenticated    | Log a freeform activity entry |

Error responses use standard status codes: `400` validation errors,
`401` missing/invalid/expired token, `403` forbidden (role/ownership),
`404` not found, `500` unexpected server errors — always as
`{ "error": "message" }` (validation errors also include a `fields` map).

## 11. Role-Based Access Explanation

Permissions are enforced in **two layers**:

1. **Frontend** — the UI only shows admin controls (New Task button,
   Edit/Delete icons, full edit form) to admins; employees see a
   status-only dropdown in the table.
2. **Backend (source of truth)** — every route re-checks the role and,
   for employees, task ownership:
   - `POST /tasks` and `DELETE /tasks/:id` require `role === "admin"`.
   - `PUT/PATCH /tasks/:id` allows employees to submit **only** a
     `status` field, and only when `task.assignedTo === req.user.id`;
     any other field or task returns `403`.
   - `GET /tasks` and `GET /activities` are filtered server-side, so
     the API itself never returns data an employee shouldn't see —
     it doesn't rely on the frontend to hide it.

## 12. Screenshots

_See `/screenshots` — add UI screenshots here (login, dashboard, tasks
table, activity log, mobile view) before submitting._

## 13. Future Improvements

- Swap JSON-file storage for SQLite/Postgres via an ORM (Prisma), with
  the same `db.js` interface so no route code has to change
  - a start on this is already possible since all data access is
    isolated to `server/src/db.js`
- Real password hashing (bcrypt) and refresh tokens instead of a
  long-lived JWT
- Optimistic updates in TanStack Query mutations for instant UI feedback
- Bulk actions (multi-select delete/reassign) in the task table
- Task comments/attachments
- Unit + integration tests (Vitest/Jest + Supertest)
- Email notifications when a task is assigned or its due date is near
