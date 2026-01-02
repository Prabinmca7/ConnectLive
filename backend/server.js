import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initChatSocket } from "./sockets/chatSocket.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chats", chatRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initChatSocket(io);

server.listen(4000, () =>
  console.log("🚀 Server running on port 4000")
);
