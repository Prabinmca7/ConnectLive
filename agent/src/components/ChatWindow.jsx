import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";

const ChatWindow = ({ currentChat }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", ({ from, message }) => {
      setMessages((prev) => [...prev, { from, message }]);
    });

    return () => socket.off("receive-message");
  }, [socket]);

  const sendMessage = (msg) => {
    if (!currentChat || !msg.trim()) return;
    console.log("Agent sending message to:", currentChat.socketId);
    socket.emit("send-message", { to: currentChat.socketId, message: msg });
    setMessages([...messages, { from: "You", message: msg }]);
  };

  if (!currentChat) {
    return <div className="chat-window">Select a chat to start</div>;
  }

  return (
    <div className="chat-window">
      <h3>Chat with {currentChat.name}</h3>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;