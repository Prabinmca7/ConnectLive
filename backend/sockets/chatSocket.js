let agents = [];
let waitingCustomers = [];

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ⭐ Store customer name when connected
    socket.customerName = ""; 

    // 🧪 Test emit
    setTimeout(() => {
      console.log("🧪 Sending test message from server...");
      io.emit("receive-message", { from: "server", name: "Server", message: "Server test message" }); // ⭐ UPDATED
    }, 5000);

    socket.on("agent-online", (agent) => {
      agents.push({ socketId: socket.id, ...agent, available: true });
      io.emit("agent-list", agents);
    });

    socket.on("agent-offline", () => {
      agents = agents.filter((a) => a.socketId !== socket.id);
      io.emit("agent-list", agents);
    });

    socket.on("customer-request", (customerData) => {
      const availableAgent = agents.find((a) => a.available);
      if (!availableAgent) {
        socket.emit("no-agents", "No agents are available now.");
        return;
      }

      // ⭐ Save customer name for later messages
      socket.customerName = customerData.name; // ⭐ UPDATED

      const customer = {
        socketId: socket.id,
        ...customerData,
      };

      availableAgent.available = false;
      waitingCustomers.push({ customerId: socket.id, agentId: availableAgent.socketId });

      io.to(availableAgent.socketId).emit("chat-request", { customer });
    });

    socket.on("accept-chat", ({ customerId }) => {
      console.log("Agent accepted chat with:", customerId);
      io.to(customerId).emit("chat-accepted", { agentId: socket.id });
    });

    socket.on("send-message", ({ to, message }) => {
      console.log("📤 Message relay triggered");
      console.log("   From:", socket.id);
      console.log("   To:", to);
      console.log("   Message:", message);

      // ⭐ Include customer name when sending to agent
      io.to(to).emit("receive-message", { 
        from: socket.id, 
        name: socket.customerName, // ⭐ UPDATED
        message 
      });
    });

    socket.on("disconnect", () => {
      agents = agents.filter((a) => a.socketId !== socket.id);
      waitingCustomers = waitingCustomers.filter((c) => c.customerId !== socket.id);

      io.emit("agent-list", agents);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
