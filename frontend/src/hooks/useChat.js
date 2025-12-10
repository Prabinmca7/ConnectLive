import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import botFlow from "../data/botFlow.json";

export const useChat = (user, agentId) => {
  const socket = useSocket();
  const [chat, setChat] = useState([]);
  

  // 1️⃣ Show greeting message when chat starts
  useEffect(() => {
    setChat([
      {
        sender: "Bot",
        text: botFlow.greeting.message
      }
    ]);
  }, []);



  // 2️⃣ Socket listener for receiving agent messages

  useEffect(() => {
    if (!socket) return;

    console.log("✅ useChat connected with socket:", socket.id);

    const handleReceive = ({ from, message }) => {
      console.log("💬 Message received from:", from, message);
      setChat((prev) => [...prev, { text: message, sender: "Agent" }]);
    };

    socket.on("receive-message", handleReceive);

    return () => socket.off("receive-message", handleReceive);
  }, [socket]);



  // 3️⃣ Send message from user to agent

  const sendMessage = (message) => {
    if (!socket || !message.trim()) return;

    console.log("📤 Sending message to:", agentId, "msg:", message);
    socket.emit("send-message", { to: agentId, message });

    setChat((prev) => [...prev, { text: message, sender: "You" }]);
  };

  return { chat, sendMessage };
};