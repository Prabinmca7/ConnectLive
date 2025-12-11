import React from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ user, agentId, onConnectAgent }) => {
  const { chat, sendMessage, currentStep } = useChat(
    user,
    agentId,
    onConnectAgent
  );

  const handleOptionClick = (option) => {
    const flow = option.action || option.nextStep;
    sendMessage(null, flow);
  };

  return (
    <div className="chat-container">
      <ChatHeader />

      <ChatBox
        chat={chat}
        currentStep={currentStep}
        onOptionClick={handleOptionClick}
      />

      <ChatInput onSend={(msg) => sendMessage(msg)} />
    </div>
  );
};

export default ChatWindow;
