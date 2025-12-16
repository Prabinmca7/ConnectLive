import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";

const ChatWindow = ({ currentChat }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  /* Incoming live messages */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ name, message }) => {
      setMessages(prev => [...prev, { from: name, message }]);
    };

    socket.on("receive-message", handler);
    return () => socket.off("receive-message", handler);
  }, [socket]);

  /* Full history on accept */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ history }) => {
      setMessages(
        history.map(m => ({
          from: m.sender,
          message: m.text
        }))
      );
    };

    socket.on("chat-history", handler);
    return () => socket.off("chat-history", handler);
  }, [socket]);

  /* Switch chat */


  const sendMessage = (msg) => {
    if (!msg.trim() || !currentChat?.socketId) return;

    socket.emit("send-message", {
      to: currentChat.socketId,
      message: msg
    });

    setMessages(prev => [...prev, { from: "You", message: msg }]);
  };

  if (!currentChat) {
    return <div className="chat-window empty">Select a chat</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{currentChat.name}</h3>
        <p>{currentChat.email}</p>
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i}><strong>{m.from}:</strong> {m.message}</div>
        ))}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;
