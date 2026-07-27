import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /users - list of users (for the "Assigned To" dropdown, etc.)
// Available to any authenticated user; passwords are stripped.
router.get("/", requireAuth, (req, res) => {
  const users = db.getUsers().map(({ password, ...rest }) => rest);
  res.json(users);
});

export default router;
