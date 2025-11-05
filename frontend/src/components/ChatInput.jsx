import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "../styles/Chat.css";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <footer className="chat-input">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend}>
        <FaPaperPlane />
      </button>
    </footer>
  );
};

export default ChatInput;