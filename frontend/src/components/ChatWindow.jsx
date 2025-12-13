import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ user, agentId }) => {
  const { chat, sendMessage } = useChat(user, agentId);
  const currentChat= { ...user, agentSocketId: agentId };

  return (
    <div className="chat-container">
      <ChatHeader currentChat={currentChat} />
      <ChatBox chat={chat} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;