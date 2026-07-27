// Restricts a route to a specific set of roles. Used on top of
// requireAuth so req.user is always available here.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions for this action." });
    }
    next();
  };
}
