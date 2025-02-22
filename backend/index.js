import pg from "pg";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const client = new pg.Client({
  user: "admin",
  password: "123456",
  host: process.env.DB_HOST || "localhost",
  port: "5432",
  database: "heyzap",
});

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) =>
    console.error("Error connecting to PostgreSQL database", err)
  );

const activeUsers = new Map();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied, token not provided" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

app.post("/register", async (req, res) => {
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
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
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

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Error during login", err);
    res.status(500).json({ error: "Error during login" });
  }
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized"));
  }
  try {
    const user = jwt.verify(token, SECRET_KEY);
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.user.username);

  activeUsers.set(socket.user.id, socket.user.username);
  io.emit("active users", Array.from(activeUsers.values()));

  const messages = await client.query(
    `SELECT m.user_id, u.username, m.message AS content, m.created_at 
     FROM messages m
     JOIN users u ON m.user_id = u.id
     ORDER BY m.created_at ASC`
  );
  socket.emit("previous messages", messages.rows);

  socket.on("chat message", async (data) => {
    const { content } = data;
    const { id, username } = socket.user;
    try {
      await client.query(
        "INSERT INTO messages (user_id, username, message) VALUES ($1, $2, $3)",
        [id, username, content]
      );
      io.emit("chat message", { user_id: id, username, content });
    } catch (err) {
      console.error("Error saving message to database", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.username);
    activeUsers.delete(socket.user.id);
    io.emit("active users", Array.from(activeUsers.values()));
  });

  socket.on("update messages", (updatedMessages) => {
    socket.emit("previous messages", updatedMessages);
  });
});

app.put("/update-username", verifyToken, async (req, res) => {
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
    await client.query("UPDATE messages SET username = $1 WHERE user_id = $2", [
      newUsername,
      userId,
    ]);

    const updatedUser = await client.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    const user = updatedUser.rows[0];
    const newToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    if (activeUsers.has(userId)) {
      activeUsers.set(userId, newUsername);
      io.emit("active users", Array.from(activeUsers.values()));
    }

    const updatedMessages = await client.query(
      "SELECT user_id, username, message AS content, created_at FROM messages ORDER BY created_at ASC"
    );
    io.emit("update messages", updatedMessages.rows);

    res.json({
      message: "Username updated successfully",
      newUsername: user.username,
      token: newToken,
    });
  } catch (err) {
    console.error("Error updating username", err);
    res.status(500).json({ error: "Error updating username" });
  }
});

server.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
