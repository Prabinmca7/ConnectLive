import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";
import botFlow from "../data/botFlow.json"; // Save JSON separately

const ChatWindow = ({ user, agentId }) => {

  
  const { chat, sendMessage } = useChat(user, agentId);

  return (
    <div className="chat-container">
      <ChatHeader />
      <ChatBox chat={chat} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;