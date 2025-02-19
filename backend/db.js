import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  senderid: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const Message = mongoose.model("Message", messageSchema);
