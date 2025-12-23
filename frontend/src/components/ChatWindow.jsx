import React from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ user }) => {
  const { chat, sendMessage, currentNode } = useChat();

  const handleOptionClick = (label, index) => {
    sendMessage(label, true, index);
  };

  return (
    <div className="chat-container">
      <ChatHeader currentChat={user} />

      <div className="chat-body-wrapper">
        <ChatBox chat={chat} />

        {/* Render buttons if the bot is waiting at an optionNode */}
        {currentNode?.type === "optionNode" && (
          <div className="options-container">
            {currentNode.data.options.map((opt, i) => (
              <button
                key={i}
                className="bot-option-btn"
                onClick={() => handleOptionClick(opt, i)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Show input only if bot is waiting for an InputNode */}
      <ChatInput
        onSend={(text) => sendMessage(text)}
        disabled={currentNode?.type === "optionNode"}
      />
    </div>
  );
};

export default ChatWindow;