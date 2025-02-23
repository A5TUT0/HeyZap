import express from "express";
import client from "../config/db.js";
import { verifyToken } from "../config/auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.put("/update-username", verifyToken, async (req, res) => {
  const { newUsername } = req.body;
  const userId = req.user.id;

  if (!newUsername) {
    return res.status(400).json({ error: "New username is required" });
  }

  try {
    const usernameExists = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [newUsername]
    );
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ error: "Username is already in use" });
    }

    await client.query("UPDATE users SET username = $1 WHERE id = $2", [
      newUsername,
      userId,
    ]);

    const updatedUser = await client.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    const user = updatedUser.rows[0];
    const newToken = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      message: "Username updated successfully",
      newUsername,
      token: newToken,
    });
  } catch (err) {
    console.error("Error updating username", err);
    res.status(500).json({ error: "Error updating username" });
  }
});

export default router;
