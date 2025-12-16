import React from "react";
import "../styles/Chat.css";

const ChatBox = ({ chat, currentStep, onOptionClick, isBotActive }) => {
  return (
    <div className="chat-box">
      {chat.map((msg, i) => (
        <div key={i} className={`chat-message ${msg.sender}`}>
          {msg.text}
        </div>
      ))}

      {/* ✅ BOT OPTIONS ONLY WHEN BOT IS ACTIVE */}
      {isBotActive && currentStep?.options && (
        <div className="chat-message Bot">
          <div className="bot-options-container">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                className="btn btn-outline-primary chat-option-btn"
                onClick={() => onOptionClick(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
