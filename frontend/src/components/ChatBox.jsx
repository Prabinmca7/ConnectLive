import React from "react";
import "../styles/Chat.css";

const ChatBox = ({ chat, onOptionClick, connectedAgentId, onEndChat }) => {
  return (
    <div className="chat-box">
      {chat.map((msg, i) => (
        <div
          key={i}
          className={`chat-message ${msg.sender === "You" ? "self" : "other"}`}
        >
          <strong>{msg.sender}:</strong> {msg.text}

          {msg.options && (
            <div className="options-container">
              {msg.options.map((opt, index) => (
                <button
                  key={index}
                  className="bot-option-btn"
                  onClick={() => onOptionClick(opt, index)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ✅ END CHAT BUTTON (ONLY WHEN AGENT CONNECTED) */}
      {connectedAgentId && (
        <div className="end-chat-container">
          <button className="end-chat-btn" onClick={onEndChat}>
            End Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
