import ChatMessage from "../models/chatMessages.js";
import { v4 as uuidv4 } from "uuid";

let agents = [];
let customers = [];

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    socket.userType = null;
    socket.userName = "";

    /* ================= AGENT ================= */
    socket.on("agent-online", ({ name }) => {
      socket.userType = "agent";
      socket.userName = name || "Agent";

      const exists = agents.find(a => a.socketId === socket.id);
      if (!exists) {
        agents.push({
          socketId: socket.id,
          name: socket.userName,
          available: true
        });
      }

      io.emit("agent-list", agents);
    });

    /* ================= CUSTOMER ================= */
    socket.on("customer-request", ({ name }) => {
      socket.userType = "user";
      socket.userName = name || "Guest";

      const chatId = uuidv4();

      customers.push({
        socketId: socket.id,
        chatId,
        name: socket.userName,
        agentId: null
      });

      // 🔹 send chatId back to customer
      socket.emit("chat-created", { chatId });

      const agent = agents.find(a => a.available);
      if (!agent) {
        socket.emit("no-agents", "No agents available");
        return;
      }

      io.to(agent.socketId).emit("chat-request", {
        customer: {
          socketId: socket.id,
          name: socket.userName,
          chatId
        }
      });
    });

    /* ================= ACCEPT CHAT ================= */
    socket.on("accept-chat", ({ customerId }) => {
      const agent = agents.find(a => a.socketId === socket.id);
      const customer = customers.find(c => c.socketId === customerId);

      if (!agent || !customer) return;

      agent.available = false;
      customer.agentId = agent.socketId;

      io.to(customer.socketId).emit("chat-accepted", {
        agentId: agent.socketId,
        agentName: agent.name,
        chatId: customer.chatId
      });

      io.emit("agent-list", agents);
    });

    /* ================= SAVE MESSAGE ================= */
    socket.on("send-message", async ({ to, chatId, message }) => {
      if (!chatId || !message) {
        console.log("❌ Missing chatId or message");
        return;
      }

      try {
        const senderType = socket.userType === "agent" ? "agent" : "user";
        const receiverType = senderType === "agent" ? "user" : "agent";

        await ChatMessage.create({
          chatId,
          from: senderType,
          to: receiverType,
          message
        });

        console.log("✅ Message saved:", message);

        io.to(to).emit("receive-message", {
          name: socket.userName,
          message
        });

      } catch (err) {
        console.error("❌ DB save error:", err.message);
      }
    });

    /* ================= END CHAT ================= */
    socket.on("end-chat", ({ chatId }) => {
      const customer = customers.find(c => c.chatId === chatId);
      if (!customer) return;

      const agent = agents.find(a => a.socketId === customer.agentId);
      if (agent) agent.available = true;

      io.emit("agent-list", agents);

      io.to(customer.socketId).emit("chat-ended", {
        message: "Chat ended"
      });
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      agents = agents.filter(a => a.socketId !== socket.id);
      customers = customers.filter(c => c.socketId !== socket.id);
      io.emit("agent-list", agents);
    });
  });
};
