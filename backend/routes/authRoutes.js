import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import client from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (err) {
    console.error("Error during login", err);
    res.status(500).json({ error: "Error during login" });
  }
});

export default router;
