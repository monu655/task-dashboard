import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

// Simple JSON-file-based persistence layer.
// Chosen over SQLite so the project runs anywhere with zero native
// dependencies / build steps, while still giving real, durable
// persistence across server restarts (unlike an in-memory array).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

const SEED = {
  users: [
    {
      id: "u_admin",
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    },
    {
      id: "u_rahul",
      name: "Rahul",
      email: "rahul@example.com",
      password: "employee123",
      role: "employee",
    },
    {
      id: "u_priya",
      name: "Priya",
      email: "priya@example.com",
      password: "employee123",
      role: "employee",
    },
  ],
  tasks: [
    {
      id: "t_1",
      title: "Website Update",
      description: "Refresh the marketing homepage with new copy and images.",
      assignedTo: "u_rahul",
      priority: "High",
      status: "In Progress",
      dueDate: "2026-08-05",
      createdAt: "2026-07-20T09:00:00.000Z",
    },
    {
      id: "t_2",
      title: "SEO Audit",
      description: "Run a full technical SEO audit on the product pages.",
      assignedTo: "u_priya",
      priority: "Medium",
      status: "To Do",
      dueDate: "2026-08-10",
      createdAt: "2026-07-21T10:30:00.000Z",
    },
    {
      id: "t_3",
      title: "Homepage Banner",
      description: "Design and ship the new seasonal homepage banner.",
      assignedTo: "u_priya",
      priority: "Low",
      status: "Completed",
      dueDate: "2026-07-25",
      createdAt: "2026-07-15T08:00:00.000Z",
    },
    {
      id: "t_4",
      title: "API Rate Limiting",
      description: "Add rate limiting middleware to the public API endpoints.",
      assignedTo: "u_rahul",
      priority: "High",
      status: "To Do",
      dueDate: "2026-08-02",
      createdAt: "2026-07-22T14:00:00.000Z",
    },
  ],
  activities: [
    {
      id: "a_1",
      user: "Admin",
      action: 'Admin assigned "SEO Audit" to Priya',
      timestamp: "2026-07-21T10:30:00.000Z",
    },
    {
      id: "a_2",
      user: "Priya",
      action: 'Priya completed "Homepage Banner"',
      timestamp: "2026-07-25T16:00:00.000Z",
    },
  ],
};

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2));
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  // Users
  getUsers() {
    return readDb().users;
  },
  findUserByEmail(email) {
    return readDb().users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
  },
  findUserById(id) {
    return readDb().users.find((u) => u.id === id);
  },

  // Tasks
  getTasks() {
    return readDb().tasks;
  },
  getTaskById(id) {
    return readDb().tasks.find((t) => t.id === id);
  },
  createTask(task) {
    const data = readDb();
    const newTask = {
      id: `t_${nanoid(8)}`,
      createdAt: new Date().toISOString(),
      ...task,
    };
    data.tasks.push(newTask);
    writeDb(data);
    return newTask;
  },
  updateTask(id, updates) {
    const data = readDb();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    data.tasks[idx] = { ...data.tasks[idx], ...updates };
    writeDb(data);
    return data.tasks[idx];
  },
  deleteTask(id) {
    const data = readDb();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    data.tasks.splice(idx, 1);
    writeDb(data);
    return true;
  },

  // Activities
  getActivities() {
    return readDb()
      .activities.slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  createActivity({ user, action }) {
    const data = readDb();
    const activity = {
      id: `a_${nanoid(8)}`,
      user,
      action,
      timestamp: new Date().toISOString(),
    };
    data.activities.push(activity);
    writeDb(data);
    return activity;
  },
};
