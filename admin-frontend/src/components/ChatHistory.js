import { useState } from "react";
import './ChatHistory.css';

const chatsMock = [
  {
    id: 1,
    user: "Alex",
    type: "bot",
    agent: null,
    lastMessage: "Pricing is $500/month",
    messages: [
      { from: "bot", text: "Welcome to our bot!", time: "10:00" },
      { from: "user", text: "pricing", time: "10:01" },
      { from: "bot", text: "Pricing is $500/month", time: "10:01" }
    ]
  },
  {
    id: 2,
    user: "John",
    type: "agent",
    agent: "John Doe",
    lastMessage: "Sure, I can help you",
    messages: [
      { from: "bot", text: "Connecting to agent...", time: "11:00" },
      { from: "agent", text: "Hi, this is John. How can I help?", time: "11:01" },
      { from: "user", text: "Need support", time: "11:02" }
    ]
  }
];

export default function ChatHistory() {
  const [selectedChat, setSelectedChat] = useState(chatsMock[0]);
  const [filter, setFilter] = useState("all");

  const filteredChats = chatsMock.filter((c) =>
    filter === "all" ? true : c.type === filter
  );

  return (
    <div className="chat-history">
      <div className="history-header">
        <h1>Chat History</h1>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Chats</option>
          <option value="bot">Chatbot</option>
          <option value="agent">Agent</option>
        </select>
      </div>

      <div className="history-body">
        {/* Left Panel */}
        <div className="chat-list">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                selectedChat.id === chat.id ? "active" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <strong>{chat.user}</strong>
              <span className="chat-type">
                {chat.type === "bot" ? "🤖 Bot" : `👤 ${chat.agent}`}
              </span>
              <p>{chat.lastMessage}</p>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="chat-view">
          <div className="chat-header">
            <h3>{selectedChat.user}</h3>
            <span>
              {selectedChat.type === "bot"
                ? "Chatbot Conversation"
                : `Agent: ${selectedChat.agent}`}
            </span>
          </div>

          <div className="chat-messages">
            {selectedChat.messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.from}`}>
                <span>{msg.text}</span>
                <small>{msg.time}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
