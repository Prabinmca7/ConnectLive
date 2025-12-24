import { useEffect, useState, useRef } from "react";
import flowData from "../data/botFlow.json";
import { useSocket } from "../context/SocketContext";

export const useChat = () => {
  const socket = useSocket();
  const [chat, setChat] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  const [connectedAgentId, setConnectedAgentId] = useState(null);
  const visitedNodesRef = useRef(new Set());
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  useEffect(() => {
    const startNode = flowData.nodes.find((n) => n.type === "startNode");
    if (startNode) {
      setChat([{ sender: "Bot", text: startNode.data.label }]);
      const firstEdge = flowData.edges.find((e) => e.source === startNode.id);
      if (firstEdge) {
        const nextNode = flowData.nodes.find((n) => n.id === firstEdge.target);
        setTimeout(() => triggerBotNode(nextNode), 800);
      }
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-accepted", ({ agentId }) => {
      setIsSearchingAgent(false);
      setConnectedAgentId(agentId);
      setChat((prev) => [...prev, { sender: "Bot", text: "You are now connected to an agent." }]);
    });

    socket.on("no-agents", (message) => {
      setIsSearchingAgent(false);
      setChat((prev) => [...prev, { sender: "Bot", text: message }]);
    });

    socket.on("receive-message", ({ message, name }) => {
      setChat((prev) => [...prev, { sender: name || "Agent", text: message }]);
    });

    return () => {
      socket.off("chat-accepted");
      socket.off("no-agents");
      socket.off("receive-message");
    };
  }, [socket]);

  const triggerBotNode = (node) => {
    if (!node) return;
    if (visitedNodesRef.current.has(node.id)) return;

    visitedNodesRef.current.add(node.id);
    setCurrentNodeId(node.id);

    setChat((prev) => [
      ...prev,
      {
        sender: "Bot",
        text: node.data.question || node.data.label,
        type: node.type,
      },
    ]);

    // ⛔ STOP here if messageNode → wait for Continue
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

  // UPDATED: Added userName parameter
  const sendMessage = (text, isOption = false, optionIndex = null, userName = "Guest") => {
    setChat((prev) => [...prev, { sender: "You", text }]);

    if (connectedAgentId) {
      socket.emit("send-message", { to: connectedAgentId, message: text, name: userName });
      return;
    }

    if (isOption && optionIndex === 3) {
      setIsSearchingAgent(true);
      setChat((prev) => [...prev, { sender: "Bot", text: "Checking agent availability..." }]);

      // UPDATED: Emit the actual userName to the server
      socket.emit("customer-request", { name: userName });
      return;
    }

    const currentNode = flowData.nodes.find((n) => n.id === currentNodeId);
    if (!currentNode) return;

    let nextEdge;
    if (isOption && optionIndex !== null) {
      nextEdge = flowData.edges.find(
        (e) => e.source === currentNodeId && e.sourceHandle === `opt-${optionIndex}`
      );
    } else {
      nextEdge = flowData.edges.find((e) => e.source === currentNodeId);
    }

    if (nextEdge) {
      const nextNode = flowData.nodes.find((n) => n.id === nextEdge.target);
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
  };
};