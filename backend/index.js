import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import { Message, User } from "./db.js";

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

mongoose.connect("mongodb://mongodb:27017/chatdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const activeUsers = new Map();

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(logger("dev"));

const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 5000,
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log("A user connected");

  socket.on("user connected", async ({ userId, username, email }) => {
    try {
      let user = await User.findOne({ userId });

      if (!user) {
        user = new User({
          userId,
          username,
          email,
          lastActive: new Date(),
        });
        await user.save();
        console.log(`Nuevo usuario guardado: ${username}`);
      } else {
        user.lastActive = new Date();
        await user.save();
      }

      socket.data.userId = userId;
      socket.data.username = username;

      activeUsers.set(userId, username);
      io.emit("active users", Array.from(activeUsers.values()));
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected");

    const userId = socket.data.userId;
    if (userId) {
      activeUsers.delete(userId);

      try {
        const user = await User.findOne({ userId });
        if (user) {
          user.lastActive = new Date();
          await user.save();
        }
      } catch (error) {
        console.error("Error al actualizar el estado del usuario:", error);
      }

      io.emit("active users", Array.from(activeUsers.values()));
    }
  });

  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    socket.emit("previous messages", messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }

  socket.on("chat message", async ({ senderid, content, senderName }) => {
    try {
      console.log("Sender: " + senderid);
      const message = new Message({
        senderID: senderid,
        senderName: senderName,
        content: content,
      });
      await message.save();

      io.emit("chat message", message);
      console.log("Message saved: " + content);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });
});

app.get("/", (req, res) => {
  res.send("server running");
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
