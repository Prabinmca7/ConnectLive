import { useEffect, useRef, useState } from "react";
import flowData from "../data/botFlow.json";
import { useSocket } from "../context/SocketContext";

export const useChat = () => {
  const socket = useSocket();

  const [chat, setChat] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [connectedAgentId, setConnectedAgentId] = useState(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  const [chatId, setChatId] = useState(null); // 🔹 ADDED (for DB history)

  const visitedNodesRef = useRef(new Set());

  /* ================= START BOT FLOW ================= */
  const startBotFlow = () => {
    visitedNodesRef.current.clear();

    setChat([]);
    setCurrentNodeId(null);
    setConnectedAgentId(null);
    setIsSearchingAgent(false);
    setWaitingForContinue(false);
    setChatId(null); // 🔹 ADDED (reset on new chat)

    const startNode = flowData.nodes.find(n => n.type === "startNode");
    if (!startNode) return;

    setChat([{ sender: "Bot", text: startNode.data.label }]);

    const firstEdge = flowData.edges.find(e => e.source === startNode.id);
    if (!firstEdge) return;

    const nextNode = flowData.nodes.find(n => n.id === firstEdge.target);
    setTimeout(() => triggerBotNode(nextNode), 700);
  };

  useEffect(() => {
    startBotFlow();
  }, []);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-accepted", ({ agentId, chatId }) => {
      setConnectedAgentId(agentId);
      setChatId(chatId); // 🔹 ADDED (store chatId from backend)
      setIsSearchingAgent(false);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: "You are now connected to an agent." }
      ]);
    });

    socket.on("chat-created", ({ chatId }) => {
      setChatId(chatId);
    });

    socket.on("no-agents", message => {
      setIsSearchingAgent(false);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: message || "No agents available." }
      ]);
    });

    socket.on("receive-message", ({ message, name }) => {
      setChat(prev => [
        ...prev,
        { sender: name || "Agent", text: message }
      ]);
    });

    socket.on("chat-ended", ({ message }) => {
      setChat(prev => [
        ...prev,
        { sender: "Bot", text: message || "Chat ended." }
      ]);

      setTimeout(startBotFlow, 1500);
    });

    return () => {
      socket.off("chat-accepted");
      socket.off("no-agents");
      socket.off("receive-message");
      socket.off("chat-ended");
    };
  }, [socket]);

  /* ================= BOT NODE HANDLER ================= */
  const triggerBotNode = node => {
    if (!node) return;
    if (visitedNodesRef.current.has(node.id)) return;

    visitedNodesRef.current.add(node.id);
    setCurrentNodeId(node.id);

    setChat(prev => [
      ...prev,
      {
        sender: "Bot",
        text: node.data.question || node.data.label,
        type: node.type,
        options: node.type === "optionNode" ? node.data.options : null
      }
    ]);

    if (node.type === "messageNode") {
      setWaitingForContinue(true);
    }
  };

  const handleContinue = () => {
    const edge = flowData.edges.find(e => e.source === currentNodeId);
    if (!edge) return;

    const nextNode = flowData.nodes.find(n => n.id === edge.target);
    setWaitingForContinue(false);
    triggerBotNode(nextNode);
  };

  /* ================= ACTION HANDLER ================= */
  const handleNodeAction = (node, userName) => {
    switch (node.data?.action) {
      case "CONNECT_AGENT":
        setIsSearchingAgent(true);

        setChat(prev => [
          ...prev,
          { sender: "Bot", text: node.data.question || "Connecting to agent..." }
        ]);

        socket.emit("customer-request", {
          name: userName,
          history: chat
        });
        return true;

      default:
        return false;
    }
  };



  /* ================= SEND MESSAGE ================= */
  const sendMessage = (
    text,
    isOption = false,
    optionIndex = null,
    userName = "Guest"
  ) => {
    setChat(prev => [
      ...prev.map(m => (m.options ? { ...m, options: null } : m)),
      { sender: "You", text }
    ]);

    // END CHAT
    if (text === "/end-chat" && connectedAgentId) {
      socket.emit("end-chat", { chatId }); // 🔹 ADDED chatId
      return;
    }

    // SEND MESSAGE TO AGENT
    if (connectedAgentId) {
      socket.emit("send-message", {
        to: connectedAgentId,   // agent socketId
        chatId,                 // chat session id
        message: text,
        name: userName
      });
      return;
    }

    const currentNode = flowData.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    let edge;

    if (isOption && optionIndex !== null) {
      edge = flowData.edges.find(
        e =>
          e.source === currentNodeId &&
          e.sourceHandle === `opt-${optionIndex}`
      );
    } else {
      edge = flowData.edges.find(e => e.source === currentNodeId);
    }

    if (!edge) return;

    const nextNode = flowData.nodes.find(n => n.id === edge.target);
    if (!nextNode) return;

    const actionHandled = handleNodeAction(nextNode, userName);
    if (actionHandled) return;

    setTimeout(() => triggerBotNode(nextNode), 600);
  };

  return {
    chat,
    sendMessage,
    isSearchingAgent,
    waitingForContinue,
    handleContinue,
    connectedAgentId,
    currentNode: flowData.nodes.find(n => n.id === currentNodeId)
  };
};
