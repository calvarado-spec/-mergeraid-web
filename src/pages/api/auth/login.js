import { Pool } from "pg";
import { comparePassword, generateToken } from "../../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userId = String(user.id);
    const token = generateToken(userId);

    res.setHeader("Set-Cookie", `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

    return res.status(200).json({ success: true, userId });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: err.message ?? "Database error" });
  }
}
