import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import { Message, User } from "./db.js";
import { timeStamp } from "console";

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

mongoose.connect("mongodb://mongodb:27017/chatdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
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

  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    socket.emit("previous messages", messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

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
