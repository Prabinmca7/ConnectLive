let agents = []; // Holds { socketId, username, available }
let activeChats = []; // Holds { customerId, agentId }

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Connection established: ${socket.id}`);

    // --- AGENT REGISTRATION ---
    socket.on("agent-online", (agent) => {
      // Clean up any old sessions for this agent
      agents = agents.filter(a => a.socketId !== socket.id);
      agents.push({
        socketId: socket.id,
        username: agent.name,
        available: true
      });
      console.log(`Agent ${agent.name} is ready.`);
      io.emit("agent-list", agents);
    });

    socket.on("agent-offline", () => {
      agents = agents.filter((a) => a.socketId !== socket.id);
      io.emit("agent-list", agents);
    });

    // --- CUSTOMER REQUEST HANDLER ---
    socket.on("customer-request", (customerData) => {
      // 1. Check for available agent
      const availableAgent = agents.find((a) => a.available === true);

      if (!availableAgent) {
        // No agents online or all are busy
        socket.emit("no-agents", "No agents are available right now. Please try later.");
        return;
      }

      // 2. Mark agent as busy immediately to prevent race conditions
      availableAgent.available = false;
      io.emit("agent-list", agents);

      // 3. Notify the agent that a customer wants to chat
      io.to(availableAgent.socketId).emit("chat-request", {
        customer: { socketId: socket.id, name: customerData.name }
      });
    });

    socket.on("accept-chat", ({ customerId }) => {
      activeChats.push({ customerId, agentId: socket.id });
      // Notify customer connection is successful
      io.to(customerId).emit("chat-accepted", { agentId: socket.id });
    });

    // --- MESSAGE RELAY ---
    socket.on("send-message", ({ to, message }) => {
      // Find sender name (either agent username or "Guest")
      const agent = agents.find(a => a.socketId === socket.id);
      const senderName = agent ? agent.username : "Customer";

      io.to(to).emit("receive-message", {
        from: socket.id,
        name: senderName,
        message
      });
    });

    // --- DISCONNECT ---
    socket.on("disconnect", () => {
      // If an agent leaves
      agents = agents.filter((a) => a.socketId !== socket.id);

      // If a customer leaves, free up their agent
      const session = activeChats.find(c => c.customerId === socket.id);
      if (session) {
        const linkedAgent = agents.find(a => a.socketId === session.agentId);
        if (linkedAgent) {
          linkedAgent.available = true; // Make agent available again
          io.to(linkedAgent.socketId).emit("receive-message", {
            from: "System",
            message: "Customer has disconnected."
          });
        }
        activeChats = activeChats.filter(c => c.customerId !== socket.id);
      }

      io.emit("agent-list", agents);
      console.log(`Disconnected: ${socket.id}`);
    });
  });
};