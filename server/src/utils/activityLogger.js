import { db } from "../db.js";

// Centralizes activity message formatting so every route produces
// consistent, human-readable log entries.
export function logActivity(user, action) {
  return db.createActivity({ user: user.name, action });
}

export function describeStatusChange(actorName, taskTitle, fromStatus, toStatus) {
  return `${actorName} changed "${taskTitle}" from ${fromStatus} \u2192 ${toStatus}`;
}

export function describeAssignment(actorName, taskTitle, assigneeName) {
  return `${actorName} assigned "${taskTitle}" to ${assigneeName}`;
}

export function describeCreate(actorName, taskTitle) {
  return `${actorName} created "${taskTitle}"`;
}

export function describeEdit(actorName, taskTitle) {
  return `${actorName} edited "${taskTitle}"`;
}

export function describeDelete(actorName, taskTitle) {
  return `${actorName} deleted "${taskTitle}"`;
}

export function describeCompletion(actorName, taskTitle) {
  return `${actorName} completed "${taskTitle}"`;
}
