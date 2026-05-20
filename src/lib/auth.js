import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId) {
  // Always store userId as a string so UUID values survive JWT round-trips intact.
  return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserFromRequest(req) {
  const raw = req.headers?.cookie ?? "";
  const token = raw
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("auth_token="))
    ?.slice("auth_token=".length);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded?.userId || typeof decoded.userId !== "string") return null;
  return decoded.userId;
}
