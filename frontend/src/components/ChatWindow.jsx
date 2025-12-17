import React from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ user, onConnectAgent }) => {
  const {
    chat,
    sendMessage,
    showFeedback,
    endChat,
    agentId,
    currentStep,
    isBotActive
  } = useChat(user, onConnectAgent);

  const handleOptionClick = (option) => {
    sendMessage(option.label);
  };

  return (
    <div className="chat-container">
      <ChatHeader />

      <ChatBox
        chat={chat}
        currentStep={currentStep}
        isBotActive={isBotActive}
        onOptionClick={handleOptionClick}
      />

      {showFeedback && (
        <div className="feedback-box">
          <p>How was your experience?</p>

          <button onClick={() => alert("👍 Thanks!")}>👍 Good</button>
          <button onClick={() => alert("😐 Thanks!")}>😐 Okay</button>
          <button onClick={() => alert("👎 Thanks!")}>👎 Bad</button>
        </div>
      )}

      <ChatInput onSend={sendMessage} isBotActive={isBotActive} />

      {agentId && (
        <button className="end-chat-btn" onClick={endChat}>
          End Chat
        </button>
      )}
    </div>
  );
};


export default ChatWindow;
