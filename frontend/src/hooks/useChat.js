import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import botFlow from "../data/botFlow.json";

export const useChat = (user, onConnectAgent) => {
  const socket = useSocket();

  const [chat, setChat] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isBotActive, setIsBotActive] = useState(true);
  const [agentId, setAgentId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const pushMessage = (msg) => {
    if (!msg?.text) return;
    setChat((prev) => [...prev, msg]);
  };

  const goToStep = useCallback((stepId) => {
    const step = botFlow.steps.find((s) => s.id === stepId);
    if (!step) return;

    setCurrentStep(step);
    if (step.type !== "dynamic" && step.message) {
      pushMessage({ sender: "Bot", text: step.message });
    }
  }, []);

  /* ================= INIT CHAT ================= */
  useEffect(() => {
    const start = botFlow.steps.find((s) => s.id === "start");
    setChat([
      { sender: "Bot", text: botFlow.greeting.message },
      { sender: "Bot", text: start.message }
    ]);
    setCurrentStep(start);
  }, []);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", ({ message }) => {
      pushMessage({ sender: "Agent", text: message });
    });

    socket.on("chat-accepted", ({ agentId }) => {
      setIsBotActive(false);
      setAgentId(agentId);
      setCurrentStep(null);

      onConnectAgent?.(agentId);
      pushMessage({ sender: "Bot", text: "👨‍💼 Agent connected. You can chat now." });
    });

    socket.on("no-agents", (msg) => {
      pushMessage({ sender: "Bot", text: msg });
      goToStep("start");
    });

    socket.on("chat-ended", ({ message, showFeedback }) => {
      pushMessage({ sender: "Bot", text: message });

      setAgentId(null);
      setIsBotActive(true);
      setShowFeedback(!!showFeedback);

      goToStep("start");

      if (showFeedback) {
        // TODO: Show feedback modal
        console.log("💬 Show feedback prompt to user");
      }
    });

    return () => socket.removeAllListeners();
  }, [socket, goToStep, onConnectAgent]);

  /* ================= AUTO-END CHAT ON CLOSE / REFRESH ================= */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (agentId) {
        socket.emit("end-chat");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [agentId, socket]);

  /* ================= CHAT FLOW ================= */
  const runFlow = (text) => {
    if (!isBotActive || !currentStep) return;

    const userText = text.toLowerCase().trim();

    /* INPUT STEP */
    if (currentStep.type === "input") {
      pushMessage({ sender: "Bot", text: "Thanks for sharing 👍" });
      if (currentStep.inputNext) goToStep(currentStep.inputNext);
      else goToStep("start");
      return;
    }

    /* YES / NO STEP */
    if (currentStep.type === "yes_no") {
      if (userText.startsWith("y")) { goToStep(currentStep.yesNext); return; }
      if (userText.startsWith("n")) { goToStep(currentStep.noNext); return; }
      if (userText.includes("start") || userText.includes("menu") || userText.includes("back")) {
        goToStep("start");
        return;
      }
      pushMessage({
        sender: "Bot",
        text: "Please reply with **Yes** or **No**, or type **menu** 🙂"
      });
    }

    /* DYNAMIC STEP */
    if (currentStep.type === "dynamic") {
      if (userText.includes("product")) {
        pushMessage({
          sender: "Bot",
          text: "We offer a task management platform with automation, analytics, and real-time chat support."
        });
        goToStep("start"); return;
      }
      if (userText.includes("price") || userText.includes("cost")) { goToStep("pricing_main"); return; }
      if (userText.includes("support") || userText.includes("issue")) { goToStep("tech_support"); return; }
      pushMessage({
        sender: "Bot",
        text: "That’s a great question 🤔\n\nI can connect you with a live agent, or you can explore options below."
      });
      goToStep("start"); return;
    }

    /* EXACT OPTION MATCH */
    const option = currentStep.options?.find(opt => opt.label.toLowerCase() === userText);
    if (option) {
      if (option.action === "connect_agent") {
        pushMessage({ sender: "Bot", text: "Connecting you to a live agent..." });
        socket.emit("customer-request", { name: user.name, history: chat });
        return;
      }
      if (option.nextStep) { goToStep(option.nextStep); return; }
    }

    /* GLOBAL KEYWORD ROUTING */
    if (userText.includes("agent") || userText.includes("human")) {
      pushMessage({ sender: "Bot", text: "Connecting you to a live agent..." });
      socket.emit("customer-request", { name: user.name, history: chat });
      return;
    }

    if (userText.includes("price")) { goToStep("pricing_main"); return; }
    if (userText.includes("support")) { goToStep("tech_support"); return; }

    /* UNIVERSAL FALLBACK */
    pushMessage({
      sender: "Bot",
      text:
        "I didn’t fully understand that 🤔\n\n" +
        "You can:\n" +
        "• Choose an option below\n" +
        "• Ask about pricing or support\n" +
        "• Type **agent** to talk to a human"
    });
    goToStep("start");
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (text) => {
    if (!text.trim()) return;

    pushMessage({ sender: "You", text });

    if (!isBotActive && agentId) {
      socket.emit("send-message", { to: agentId, message: text });
      return;
    }

    runFlow(text);
  };

  const selectOption = (label) => {
    pushMessage({ sender: "You", text: label });
    runFlow(label);
  };

  const endChat = () => {
    if (!agentId) return;

    socket.emit("end-chat");
    setAgentId(null);
    setIsBotActive(true);
    goToStep("start");
    pushMessage({ sender: "Bot", text: "You have ended the chat. Returning to bot..." });
  };

  return {
    chat,
    currentStep,
    isBotActive,
    agentId,
    showFeedback,
    sendMessage,
    selectOption,
    endChat
  };
};

export default useChat;
