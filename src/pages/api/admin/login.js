import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// In-memory rate limiter: ip → { count, windowStart }
const failureMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip) {
  const entry = failureMap.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.windowStart > WINDOW_MS) {
    failureMap.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const now = Date.now();
  const entry = failureMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    failureMap.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

function clearFailures(ip) {
  failureMap.delete(ip);
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many failed attempts. Try again in 15 minutes." });
  }

  const { password } = req.body ?? {};

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    recordFailure(ip);
    return res.status(401).json({ error: "Invalid credentials." });
  }

  clearFailures(ip);

  const token = jwt.sign(
    { isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.setHeader(
    "Set-Cookie",
    serialize("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60,
      path: "/",
    })
  );

  return res.status(200).json({ ok: true });
}
