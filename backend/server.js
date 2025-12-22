import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import agentRoutes from "./routes/agentRoutes.js";
import { initChatSocket } from "./sockets/chatSocket.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/agents", agentRoutes);

import chatRoutes from "./routes/chatRoutes.js";
app.use("/api/chats", chatRoutes);


// HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Initialize chat sockets
initChatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));