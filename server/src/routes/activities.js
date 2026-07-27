import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /activities
// Admins see everything. Employees see only activities that mention
// their own name or a task currently assigned to them, so they get
// relevant history without seeing unrelated admin/employee actions.
router.get("/", requireAuth, (req, res) => {
  const all = db.getActivities();

  if (req.user.role === "admin") {
    return res.json(all);
  }

  const myTasks = db.getTasks().filter((t) => t.assignedTo === req.user.id);
  const myTaskTitles = new Set(myTasks.map((t) => t.title));

  const relevant = all.filter((activity) => {
    if (activity.user === req.user.name) return true;
    for (const title of myTaskTitles) {
      if (activity.action.includes(`"${title}"`)) return true;
    }
    return false;
  });

  res.json(relevant);
});

// POST /activities - allows the client to log freeform activity
// if needed (e.g. future extensions). Task-driven activities are
// created automatically by the tasks routes.
router.post("/", requireAuth, (req, res) => {
  const { action } = req.body || {};
  if (!action || typeof action !== "string") {
    return res.status(400).json({ error: "An 'action' string is required." });
  }
  const activity = db.createActivity({ user: req.user.name, action });
  res.status(201).json(activity);
});

export default router;
