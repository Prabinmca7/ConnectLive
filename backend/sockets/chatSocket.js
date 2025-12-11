let agents = [];
let waitingCustomers = [];

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // AGENT ONLINE
    socket.on("agent-online", (agent) => {
      agents.push({
        socketId: socket.id,
        ...agent,
        available: true,
      });
    });

    // AGENT OFFLINE
    socket.on("agent-offline", () => {
      agents = agents.filter(a => a.socketId !== socket.id);
    });

    // CUSTOMER wants to connect with agent
    socket.on("customer-request", (customer) => {
      const availableAgent = agents.find(a => a.available);

      if (!availableAgent) {
        socket.emit("no-agents", "No agents are available right now.");
        return;
      }

      availableAgent.available = false;

      waitingCustomers.push({
        customerId: socket.id,
        agentId: availableAgent.socketId
      });

      io.to(availableAgent.socketId).emit("chat-request", { customer });
    });

    // AGENT accepts chat
    socket.on("accept-chat", ({ customerId }) => {
      io.to(customerId).emit("chat-accepted", { agentId: socket.id });
    });

    // MESSAGE RELAY
    socket.on("send-message", ({ to, message }) => {
      io.to(to).emit("receive-message", {
        message
      });
    });

    socket.on("disconnect", () => {
      agents = agents.filter(a => a.socketId !== socket.id);
      waitingCustomers = waitingCustomers.filter(c => c.customerId !== socket.id);
    });
  });
};
