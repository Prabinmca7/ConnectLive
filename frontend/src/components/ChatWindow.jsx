import React from "react";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";
import { useSocket } from "../context/SocketContext";

const ChatWindow = ({ user }) => {
  const socket = useSocket();

  const {
    chat,
    sendMessage,
    currentNode,
    waitingForContinue,
    handleContinue,
    connectedAgentId
  } = useChat();

  const handleOptionClick = (label, index) => {
    sendMessage(label, true, index, user?.name);
  };

  // ✅ END CHAT HANDLER
  const handleEndChat = () => {
    if (!socket) return;

    if (window.confirm("Are you sure you want to end the chat?")) {
      sendMessage("/end-chat");
    }
  };

  return (
    <div className="chat-container">
      <ChatHeader currentChat={user} />

      <div className="chat-body-wrapper">
        <ChatBox
          chat={chat}
          onOptionClick={handleOptionClick}
          connectedAgentId={connectedAgentId}
          onEndChat={handleEndChat}
        />

        {waitingForContinue && (
          <div className="continue-container">
            <button className="continue-btn" onClick={handleContinue}>
              Continue
            </button>
          </div>
        )}
      </div>

      <ChatInput
        onSend={(text) => sendMessage(text, false, null, user?.name)}
        disabled={currentNode?.type === "optionNode"}
      />
    </div>
  );
};

export default ChatWindow;
