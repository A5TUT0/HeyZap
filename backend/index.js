import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";

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

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
    console.log("message: " + msg);
  });
});

app.get("/", (req, res) => {
  res.send("server running");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
