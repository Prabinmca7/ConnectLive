import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export const useChat = (user, agentId) => {
  const socket = useSocket();
  const [chat, setChat] = useState([]);

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

  const sendMessage = (message) => {
    if (!socket || !message.trim()) return;

    console.log("📤 Sending message to:", agentId, "msg:", message);
    socket.emit("send-message", { to: agentId, message });

    setChat((prev) => [...prev, { text: message, sender: "You" }]);
  };

  return { chat, sendMessage };
};