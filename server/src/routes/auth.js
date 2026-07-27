import { Router } from "express";
import { db } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user);
  const { password: _pw, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /auth/me - returns the currently authenticated user
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
