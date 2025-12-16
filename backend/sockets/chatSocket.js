let agents = [];      // { socketId, name, available }
let customers = [];  // { socketId, name, agentId, chatHistory }

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    socket.userType = null;
    socket.userName = "";

    /* ================= AGENT ================= */

    socket.on("agent-online", ({ name }) => {
      socket.userType = "agent";
      socket.userName = name || "Agent";

      const existing = agents.find(a => a.socketId === socket.id);
      if (!existing) {
        agents.push({
          socketId: socket.id,
          name: socket.userName,
          available: true
        });
      } else {
        existing.available = true;
      }

      io.emit("agent-list", agents);
    });

    socket.on("accept-chat", ({ customerId }) => {
      const agent = agents.find(a => a.socketId === socket.id && a.available);
      const customer = customers.find(c => c.socketId === customerId);

      if (!agent || !customer) return;

      agent.available = false;
      customer.agentId = socket.id;

      // ✅ send full history to agent
      io.to(agent.socketId).emit("chat-history", {
        customer: {
          socketId: customer.socketId,
          name: customer.name
        },
        history: customer.chatHistory
      });

      io.to(customer.socketId).emit("chat-accepted", {
        agentId: agent.socketId,
        agentName: agent.name
      });
    });

    /* ================= CUSTOMER ================= */

    socket.on("customer-request", ({ name }) => {
      socket.userType = "customer";
      socket.userName = name;

      if (customers.some(c => c.socketId === socket.id)) return;

      const agent = agents.find(a => a.available);
      if (!agent) {
        socket.emit("no-agents", "No agents are available now.");
        return;
      }

      customers.push({
        socketId: socket.id,
        name,
        agentId: null,
        chatHistory: []
      });

      io.to(agent.socketId).emit("chat-request", {
        customer: { socketId: socket.id, name }
      });
    });

    /* ================= MESSAGE ================= */

    socket.on("send-message", ({ to, message }) => {
      if (!to || !message) return;

      const customer = customers.find(
        c => c.socketId === socket.id || c.agentId === socket.id
      );

      if (customer) {
        customer.chatHistory.push({
          sender: socket.userType === "agent" ? "Agent" : "You",
          text: message
        });
      }

      io.to(to).emit("receive-message", {
        from: socket.id,
        name: socket.userName,
        message
      });
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", () => {
      if (socket.userType === "agent") {
        agents = agents.filter(a => a.socketId !== socket.id);

        customers.forEach(c => {
          if (c.agentId === socket.id) {
            c.agentId = null;
            io.to(c.socketId).emit("no-agents", "Agent disconnected.");
          }
        });
      }

      customers = customers.filter(c => c.socketId !== socket.id);
      io.emit("agent-list", agents);
    });
  });
};
