import React from "react";
import "../styles/Chat.css";


const ChatBox = ({ chat }) => {
  return (
    <div className="chat-box">
      {chat.map((msg, i) => (
        <div key={i} className={`chat-message ${msg.sender === "You" ? "self" : "other"}`}>
          <strong>{msg.sender}:</strong> {msg.text}
        </div>
      ))}

      
    </div>
  );
};

export default ChatBox;