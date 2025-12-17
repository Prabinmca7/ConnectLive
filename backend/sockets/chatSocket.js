let agents = [];      // { socketId, name, available }
let customers = [];   // { socketId, name, agentId, chatHistory }

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

    socket.on("agent-offline", () => {
      if (socket.userType !== "agent") return;
      const agent = agents.find(a => a.socketId === socket.id);
      if (agent) {
        agent.available = false;
        io.emit("agent-list", agents);
      }
    });

    socket.on("accept-chat", ({ customerId }) => {
      const agent = agents.find(a => a.socketId === socket.id && a.available);
      const customer = customers.find(c => c.socketId === customerId);
      if (!agent || !customer) return;

      agent.available = false;
      customer.agentId = socket.id;

      io.to(agent.socketId).emit("chat-history", {
        customer: { socketId: customer.socketId, name: customer.name },
        history: customer.chatHistory
      });

      io.to(customer.socketId).emit("chat-accepted", {
        agentId: agent.socketId,
        agentName: agent.name
      });

      io.emit("agent-list", agents);
    });

    /* ================= CUSTOMER ================= */
    socket.on("customer-request", ({ name, history }) => {
      socket.userType = "customer";
      socket.userName = name;

      let customer = customers.find(c => c.socketId === socket.id);
      if (!customer) {
        customer = {
          socketId: socket.id,
          name,
          agentId: null,
          chatHistory: history || []
        };
        customers.push(customer);
      }

      const agent = agents.find(a => a.available);
      if (!agent) {
        socket.emit("no-agents", "No agents are available now.");
        return;
      }

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
        name: socket.userName,
        message
      });
    });

    /* ================= END CHAT ================= */
    const handleEndChat = (customerSocketId) => {
      const customer = customers.find(c => c.socketId === customerSocketId);
      if (!customer || !customer.agentId) return;

      const agent = agents.find(a => a.socketId === customer.agentId);

      if (agent) {
        agent.available = true;
        io.to(agent.socketId).emit("chat-ended", {
          customerId: customer.socketId,
          message: "Customer ended the chat"
        });
      }

      customer.agentId = null;

      io.to(customer.socketId).emit("chat-ended", {
        message: "Chat ended. Please rate your experience.",
        showFeedback: true
      });

      io.emit("agent-list", agents);
    };

    socket.on("end-chat", () => {
      if (socket.userType !== "customer") return;
      handleEndChat(socket.id);
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      // If an agent disconnects
      if (socket.userType === "agent") {
        agents = agents.filter(a => a.socketId !== socket.id);

        // Notify customers that agent disconnected
        customers.forEach(c => {
          if (c.agentId === socket.id) {
            c.agentId = null;
            io.to(c.socketId).emit("no-agents", "Agent disconnected.");
          }
        });
      }

      // If a customer disconnects, end their chat automatically
      if (socket.userType === "customer") {
        handleEndChat(socket.id);
      }

      // Remove disconnected customer
      customers = customers.filter(c => c.socketId !== socket.id);

      io.emit("agent-list", agents);
    });
  });
};
