import pg from "pg";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

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

const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 5000,
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");

    // Execute SQL queries here

    client.query("SELECT * FROM employees", (err, result) => {
      if (err) {
        console.error("Error executing query", err);
      } else {
        console.log("Query result:", result.rows);
      }
    });
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const haschPassword = await bcrypt.hash(password, 10);

  try {
    const result = await client.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, haschPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user connected", ({ userId, username, email }) => {
    console.log("User connected", userId, username, email);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
