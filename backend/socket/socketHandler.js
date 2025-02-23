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
      `SELECT m.sender_id, u.username, m.message AS content, m.created_at 
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       ORDER BY m.created_at ASC`
    );

    socket.emit("previous messages", messages.rows);

    socket.on("chat message", async (data) => {
      const { content } = data;
      const { id } = socket.user;

      try {
        // Verificar si el usuario con id existe en la tabla users
        const userCheck = await client.query(
          "SELECT id FROM users WHERE id = $1",
          [id]
        );
        if (userCheck.rows.length === 0) {
          console.error("User does not exist in the database.");
          return socket.emit("chat message error", {
            error: "User does not exist.",
          });
        }

        // Insertar el sender_id (que es el ID del usuario que envía el mensaje) y el contenido del mensaje
        await client.query(
          "INSERT INTO messages (sender_id, message) VALUES ($1, $2)",
          [id, content]
        );

        // Emitir el mensaje sin username, ya que lo puedes obtener desde la base de datos
        io.emit("chat message", { sender_id: id, content });
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
