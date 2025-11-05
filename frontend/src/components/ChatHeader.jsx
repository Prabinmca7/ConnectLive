import React from "react";
import "../styles/Chat.css";
import { FaPhoneAlt, FaVideo, FaPaperclip, FaDesktop } from "react-icons/fa";

const ChatHeader = () => {
  return (
    <header className="chat-header">
      <h3>Chat with Support</h3>
      <div className="chat-actions">
        <FaPhoneAlt title="Audio Call" />
        <FaVideo title="Video Call" />
        <FaDesktop title="Screen Share" />
        <FaPaperclip title="Attach File" />
      </div>
    </header>
  );
};

export default ChatHeader;