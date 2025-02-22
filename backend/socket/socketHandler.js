import client from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export default function socketHandler(io) {
  const activeUsers = new Map();

  // Middleware to authenticate users
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }

    try {
      const user = jwt.verify(token, SECRET_KEY);
      socket.user = user; // Assign the user object to socket
      next();
    } catch (err) {
      return next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    if (!socket.user) {
      console.error("Socket user is undefined");
      return socket.disconnect();
    }

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
        console.error("Error saving message", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.username);
      activeUsers.delete(socket.user.id);
      io.emit("active users", Array.from(activeUsers.values()));
    });
  });
}
