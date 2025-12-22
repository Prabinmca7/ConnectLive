import { useEffect, useState, useCallback, useRef  } from "react";
import { useSocket } from "../context/SocketContext";
import botFlow from "../data/botFlow.json";

export const useChat = (user, onConnectAgent) => {
  const socket = useSocket();

  const [chat, setChat] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isBotActive, setIsBotActive] = useState(true);
  const [agentId, setAgentId] = useState(null);


  // prevents duplicate "no agents" handling
  const waitingForAgentRef = useRef(false);


  /* ---------------- HELPERS ---------------- */

  const pushMessage = (msg) => {
    if (!msg?.text) return;

    setChat((prev) => {
      const last = prev[prev.length - 1];
      if (last?.text === msg.text && last?.sender === msg.sender) {
        return prev; // ❌ prevent duplicates
      }
      return [...prev, msg];
    });
  };

  const goToStep = useCallback((stepId) => {
    const step = botFlow.steps.find((s) => s.id === stepId);
    if (!step) return;

    setCurrentStep(step);

    if (step.message) {
      pushMessage({ sender: "Bot", text: step.message });
    }
  }, []);


  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const start = botFlow.steps.find((s) => s.id === "start");

    setChat([
      { sender: "Bot", text: botFlow.greeting.message },
      { sender: "Bot", text: start.message }
    ]);

    setCurrentStep(start);
  }, []);

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", ({ message }) => {
      pushMessage({ sender: "Agent", text: message });
    });

    socket.on("chat-accepted", ({ agentId }) => {
      setIsBotActive(false);
      setAgentId(agentId);
      setCurrentStep(null); // 🔥 stop bot completely

      onConnectAgent?.(agentId);

      pushMessage({
        sender: "Bot",
        text: "Agent connected. You can chat now."
      });
    });

    socket.on("no-agents", (msg) => {
      pushMessage({ sender: "Bot", text: msg });
      goToStep("start");
    });

    return () => socket.removeAllListeners();
  }, [socket, goToStep, onConnectAgent]);

  /* ---------------- BOT FLOW ---------------- */

  const runFlow = (text) => {
    if (!isBotActive || !currentStep) return;

    if (currentStep.type === "options") {
      const input = text.toLowerCase();

      const option = currentStep.options.find((o) =>
        o.label.toLowerCase().includes(input)
      );

      if (!option) {
        pushMessage({
          sender: "Bot",
          text: "Please select one of the options above 👆"
        });
        return;
      }

      if (option.action === "connect_agent") {
        pushMessage({ sender: "Bot", text: "Connecting to an agent..." });
        socket.emit("check-agents-availability");
        socket.emit("customer-request", user);
        return;
      }

      if (option.nextStep) {
        goToStep(option.nextStep);
      }
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = (text) => {
    if (!text.trim()) return;

    pushMessage({ sender: "You", text });

    // Agent chat
    if (!isBotActive && agentId) {
      socket.emit("send-message", {
        to: agentId,
        message: text
      });
      return;
    }

    // Bot chat
    runFlow(text);
  };

  const selectOption = (label) => {
    pushMessage({ sender: "You", text: label });
    runFlow(label);
  };

  return {
    chat,
    currentStep,
    isBotActive,
    sendMessage,
    selectOption
  };
};

export default useChat;
