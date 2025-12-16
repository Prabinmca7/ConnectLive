import React from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ user, agentId, onConnectAgent }) => {
  const { chat, sendMessage, currentStep, isBotActive } = useChat(
    user,
    agentId,
    onConnectAgent
  );

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

      <ChatInput onSend={sendMessage} isBotActive={isBotActive} />
    </div>
  );
};

export default ChatWindow;
