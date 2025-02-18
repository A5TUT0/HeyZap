import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(logger("dev"));

const io = new Server(server, {
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
});

app.get("/", (req, res) => {
  res.send("server running");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
