import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";

const ChatWindow = ({ currentChat }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  // 🧠 Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", ({ from, name, message }) => {
      console.log("📩 Received message from:", from, "Message:", message);
      setMessages(prev => [...prev, { from, name, message }]); // ⭐ UPDATED
    });

    return () => socket.off("receive-message");
  }, [socket]);

  // 🧠 Load chat messages when switching chats
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    }
  }, [currentChat]);

  // 🚀 Send a message to the current customer
  const sendMessage = (msg) => {
    if (!msg.trim()) return;

    if (!currentChat || !currentChat.socketId) {
      console.warn("⚠️ Cannot send: No active customer or socketId missing.");
      alert("Customer is not connected or chat has ended.");
      return;
    }

    console.log("💬 Sending to:", currentChat.socketId, "Message:", msg);

    // 🔥 Send to backend to relay to customer
    socket.emit("send-message", { to: currentChat.socketId, message: msg });

    // ✅ Add to local message list
    setMessages((prev) => [...prev, { from: "You", message: msg }]);
  };

  if (!currentChat) {
    return <div className="chat-window empty">Select a chat to start</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{currentChat.name}</h3>
        <p className="email">{currentChat.email}</p>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.name || msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {currentChat.status === "ended" ? (
        <div className="chat-ended">Chat has ended</div>
      ) : (
        <MessageInput onSend={sendMessage} />
      )}
    </div>
  );
};

export default ChatWindow;
