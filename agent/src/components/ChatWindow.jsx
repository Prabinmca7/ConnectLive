import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";
import "../styles/ChatWindow.css";
import { FaPhoneAlt } from "react-icons/fa"; // Importing icons

const ChatWindow = ({ currentChat }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const peerRef = useRef(null); // To store peer connection
  const [isCallActive, setIsCallActive] = useState(false);
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);

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

      {incomingCall && (
  <div className="incoming-call-inline">
    <span className="call-text">
      {incomingCall.from} is calling you...
    </span>
    <div className="call-buttons">
      <button className="accept-inline" onClick={acceptAudioCall} title="Accept Call">
        <FaPhoneAlt />
      </button>
      <button className="reject-inline" onClick={rejectAudioCall} title="Reject Call">
        <FaPhoneAlt />
      </button>
    </div>
  </div>
)}

{isCallActive && (
  <div className="call-active-bar">
    <audio ref={remoteAudioRef} autoPlay controls />
    <button className="end-call-btn" onClick={endAudioCall}>
      <FaPhoneAlt /> End Call
    </button>
  </div>
)}

      <MessageInput onSend={sendMessage} />
    </div>

    
  );
};

export default ChatWindow;
