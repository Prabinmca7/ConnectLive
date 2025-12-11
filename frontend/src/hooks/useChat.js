import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import botFlow from "../data/botFlow.json";

export const useChat = (user, agentId, onConnectAgent) => {
  const socket = useSocket();

  const [chat, setChat] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isBotActive, setIsBotActive] = useState(true);

  // Load greeting + start flow
  useEffect(() => {
    const startStep = botFlow.steps.find(s => s.id === "start");

    setChat([
      { sender: "Bot", text: botFlow.greeting.message },
      { sender: "Bot", text: startStep.message }
    ]);

    setCurrentStep(startStep);
  }, []);

  // RECEIVE messages from agent
  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", ({ message }) => {
      setIsBotActive(false);
      setChat(prev => [...prev, {
        sender: "System", text: "✅ Connected with agent. You can now chat directly."
      }]);
    });

    return () => socket.off("receive-message");
  }, [socket]);

  // Handle User Connect Request
  useEffect(() => {
    if (!socket) return;

    socket.on("no-agents", (msg) => {
      setChat(prev => [...prev, { sender: "Bot", text: msg }]);

      // Bot continues after message
      const startStep = botFlow.steps.find(s => s.id === "start");
      setCurrentStep(startStep);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: startStep.message }
      ]);
    });

    socket.on("chat-accepted", ({ agentId }) => {
      setIsBotActive(false);
      onConnectAgent(agentId);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: "Agent connected. You can chat now." }
      ]);
    });

    return () => {
      socket.off("no-agents");
      socket.off("chat-accepted");
    };
  }, [socket]);

  // BOT FLOW HANDLER
  const handleBotFlow = (stepOrAction) => {
    const action = botFlow.actions[stepOrAction];
    if (action) {
      setChat(prev => [...prev, { sender: "Bot", text: action.message }]);

      if (action.type === "handoff") {
        socket.emit("customer-request", user);
      }

      return;
    }

    const next = botFlow.steps.find(s => s.id === stepOrAction);
    if (!next) return;

    setCurrentStep(next);
    setChat(prev => [...prev, { sender: "Bot", text: next.message }]);
  };

  const sendMessage = (msg, flowAction) => {
    // Option clicked
    if (flowAction) {
      setChat(prev => [...prev, { sender: "You", text: "✔ " + flowAction }]);
      handleBotFlow(flowAction);
      return;
    }

    // User typed
    setChat(prev => [...prev, { sender: "You", text: msg }]);

    // If chatting with agent
    if (!isBotActive && agentId) {
      socket.emit("send-message", { to: agentId, message: msg });
    }
  };

  return { chat, sendMessage, currentStep };
};
