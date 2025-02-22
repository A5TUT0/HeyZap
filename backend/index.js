import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import socketHandler from "./socket/socketHandler.js";
import { verifyToken } from "./config/auth.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", verifyToken, userRoutes);
app.use("/ai", aiChatRoutes);
socketHandler(io);

server.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
