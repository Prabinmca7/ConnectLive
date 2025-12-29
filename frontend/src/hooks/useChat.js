import { useEffect, useState, useRef } from "react";
import flowData from "../data/botFlow.json";
import { useSocket } from "../context/SocketContext";

export const useChat = () => {
  const socket = useSocket();

  const [chat, setChat] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  const [connectedAgentId, setConnectedAgentId] = useState(null);
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  const visitedNodesRef = useRef(new Set());

  /* ================= START BOT FLOW ================= */
  const startBotFlow = () => {
    visitedNodesRef.current.clear();
    setChat([]);
    setCurrentNodeId(null);
    setWaitingForContinue(false);

    const startNode = flowData.nodes.find(n => n.type === "startNode");
    if (!startNode) return;

    setChat([{ sender: "Bot", text: startNode.data.label }]);

    const firstEdge = flowData.edges.find(e => e.source === startNode.id);
    if (firstEdge) {
      const nextNode = flowData.nodes.find(n => n.id === firstEdge.target);
      setTimeout(() => triggerBotNode(nextNode), 800);
    }
  };

  useEffect(() => {
    startBotFlow();
  }, []);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-accepted", ({ agentId }) => {
      setIsSearchingAgent(false);
      setConnectedAgentId(agentId);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: "You are now connected to an agent." }
      ]);
    });

    socket.on("no-agents", (message) => {
      setIsSearchingAgent(false);
      setChat(prev => [...prev, { sender: "Bot", text: message }]);
    });

    socket.on("receive-message", ({ message, name }) => {
      setChat(prev => [
        ...prev,
        { sender: name || "Agent", text: message }
      ]);
    });

    // ✅ CHAT ENDED (RESET EVERYTHING)
    socket.on("chat-ended", ({ message }) => {
      setConnectedAgentId(null);
      setIsSearchingAgent(false);

      setChat(prev => [
        ...prev,
        { sender: "Bot", text: message || "Chat ended." }
      ]);

      // restart flow after short delay
      setTimeout(() => {
        startBotFlow();
      }, 1500);
    });

    return () => {
      socket.off("chat-accepted");
      socket.off("no-agents");
      socket.off("receive-message");
      socket.off("chat-ended");
    };
  }, [socket]);

  /* ================= BOT NODE ================= */
  const triggerBotNode = (node) => {
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
    const currentNode = flowData.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    const nextEdge = flowData.edges.find(e => e.source === currentNodeId);
    if (!nextEdge) return;

    const nextNode = flowData.nodes.find(n => n.id === nextEdge.target);
    setWaitingForContinue(false);
    triggerBotNode(nextNode);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (
    text,
    isOption = false,
    optionIndex = null,
    userName = "Guest"
  ) => {
    setChat(prev => [
      ...prev.map(msg => (msg.options ? { ...msg, options: null } : msg)),
      { sender: "You", text }
    ]);

    // ✅ END CHAT
    if (text === "/end-chat" && connectedAgentId) {
      socket.emit("end-chat");
      return;
    }

    // ✅ SEND TO AGENT
    if (connectedAgentId) {
      socket.emit("send-message", {
        to: connectedAgentId,
        message: text,
        name: userName
      });
      return;
    }

    // ✅ REQUEST AGENT (OPTION INDEX 3)
    if (isOption && optionIndex === 3) {
      setIsSearchingAgent(true);
      setChat(prev => [
        ...prev,
        { sender: "Bot", text: "Checking agent availability..." }
      ]);

      socket.emit("customer-request", {
        name: userName,
        history: chat
      });
      return;
    }

    // BOT FLOW CONTINUE
    const currentNode = flowData.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    let nextEdge;
    if (isOption && optionIndex !== null) {
      nextEdge = flowData.edges.find(
        e =>
          e.source === currentNodeId &&
          e.sourceHandle === `opt-${optionIndex}`
      );
    } else {
      nextEdge = flowData.edges.find(e => e.source === currentNodeId);
    }

    if (nextEdge) {
      const nextNode = flowData.nodes.find(n => n.id === nextEdge.target);
      setTimeout(() => triggerBotNode(nextNode), 600);
    }
  };

  return {
    chat,
    sendMessage,
    isSearchingAgent,
    currentNode: flowData.nodes.find(n => n.id === currentNodeId),
    waitingForContinue,
    handleContinue,
    connectedAgentId
  };
};
