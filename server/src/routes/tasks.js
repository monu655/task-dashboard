import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  logActivity,
  describeAssignment,
  describeCreate,
  describeEdit,
  describeDelete,
  describeStatusChange,
  describeCompletion,
} from "../utils/activityLogger.js";

const router = Router();

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["To Do", "In Progress", "Completed"];

function validateTaskInput(body, { partial = false } = {}) {
  const errors = {};
  const required = ["title", "description", "assignedTo", "priority", "status", "dueDate"];

  for (const field of required) {
    if (!partial || Object.prototype.hasOwnProperty.call(body, field)) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        errors[field] = `${field} is required.`;
      }
    }
  }

  if (body.priority && !PRIORITIES.includes(body.priority)) {
    errors.priority = `priority must be one of: ${PRIORITIES.join(", ")}`;
  }
  if (body.status && !STATUSES.includes(body.status)) {
    errors.status = `status must be one of: ${STATUSES.join(", ")}`;
  }
  if (body.assignedTo && !db.findUserById(body.assignedTo)) {
    errors.assignedTo = "assignedTo must reference an existing user.";
  }

  return errors;
}

// GET /tasks
// Admin: all tasks. Employee: only tasks assigned to them.
// This filter happens server-side - the API never returns tasks
// an employee shouldn't see, regardless of what the frontend does.
router.get("/", requireAuth, (req, res) => {
  const all = db.getTasks();
  const tasks = req.user.role === "admin"
    ? all
    : all.filter((t) => t.assignedTo === req.user.id);
  res.json(tasks);
});

router.get("/:id", requireAuth, (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });

  if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: this task is not assigned to you." });
  }
  res.json(task);
});

// POST /tasks - admin only
router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const errors = validateTaskInput(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", fields: errors });
  }

  const { title, description, assignedTo, priority, status, dueDate } = req.body;
  const task = db.createTask({ title, description, assignedTo, priority, status, dueDate });

  logActivity(req.user, describeCreate(req.user.name, task.title));
  const assignee = db.findUserById(assignedTo);
  if (assignee) {
    logActivity(req.user, describeAssignment(req.user.name, task.title, assignee.name));
  }

  res.status(201).json(task);
});

// PUT/PATCH /tasks/:id
// Admin: can change any field.
// Employee: can change ONLY the status field, and only on tasks
// assigned to them. Enforced here server-side, not just hidden in UI.
function updateTaskHandler(req, res) {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });

  const isAdmin = req.user.role === "admin";
  const isOwnTask = task.assignedTo === req.user.id;

  if (!isAdmin && !isOwnTask) {
    return res.status(403).json({ error: "Forbidden: this task is not assigned to you." });
  }

  if (!isAdmin) {
    const attemptedFields = Object.keys(req.body || {});
    const disallowed = attemptedFields.filter((f) => f !== "status");
    if (disallowed.length > 0) {
      return res.status(403).json({
        error: `Forbidden: employees may only update 'status'. Disallowed fields: ${disallowed.join(", ")}`,
      });
    }
    if (!req.body.status || !STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const previousStatus = task.status;
    const updated = db.updateTask(task.id, { status: req.body.status });

    const message = req.body.status === "Completed"
      ? describeCompletion(req.user.name, task.title)
      : describeStatusChange(req.user.name, task.title, previousStatus, req.body.status);
    logActivity(req.user, message);

    return res.json(updated);
  }

  // Admin path: full edit
  const errors = validateTaskInput(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", fields: errors });
  }

  const previousAssignee = task.assignedTo;
  const previousStatus = task.status;
  const updated = db.updateTask(task.id, req.body);

  if (req.body.status && req.body.status !== previousStatus) {
    logActivity(req.user, describeStatusChange(req.user.name, task.title, previousStatus, req.body.status));
  }
  if (req.body.assignedTo && req.body.assignedTo !== previousAssignee) {
    const assignee = db.findUserById(req.body.assignedTo);
    if (assignee) {
      logActivity(req.user, describeAssignment(req.user.name, updated.title, assignee.name));
    }
  } else {
    logActivity(req.user, describeEdit(req.user.name, updated.title));
  }

  res.json(updated);
}

router.put("/:id", requireAuth, updateTaskHandler);
router.patch("/:id", requireAuth, updateTaskHandler);

// DELETE /tasks/:id - admin only
router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });

  db.deleteTask(req.params.id);
  logActivity(req.user, describeDelete(req.user.name, task.title));
  res.status(204).send();
});

export default router;
