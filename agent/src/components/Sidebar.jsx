import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/Sidebar.css";
import ChatRequestModal from "./ChatRequestModal";

const Sidebar = ({ setCurrentChat }) => {
  const socket = useSocket();
  const [chats, setChats] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);

  // Fetch chats (mock or backend)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = []; // fetch from backend if needed
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, []);

  // Listen for new chat requests
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-request", (data) => {
      setIncomingRequest(data.customer);
    });

    return () => socket.off("chat-request");
  }, [socket]);

  // Listen for chat end
  useEffect(() => {
    if (!socket) return;

    const handler = ({ customerId }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.socketId === customerId ? { ...chat, status: "ended" } : chat
        )
      );
    };

    socket.on("chat-ended", handler);
    return () => socket.off("chat-ended", handler);
  }, [socket]);

  // Accept incoming chat
  const acceptChat = (customer) => {
    if (!socket || !customer) return;

    // Send to backend
    socket.emit("accept-chat", {
      customerId: customer.socketId,
      chatId: customer.chatId // 🔹 pass chatId
    });

    const newChat = {
      _id: customer.socketId,
      name: customer.name,
      email: customer.email,
      status: "active",
      socketId: customer.socketId,
      chatId: customer.chatId,
      messages: []
    };

    setChats((prev) => [newChat, ...prev]);
    setCurrentChat(newChat);
    setIncomingRequest(null);
  };

  const rejectChat = () => {
    setIncomingRequest(null);
  };

  return (
    <aside className="sidebar">
      <h3>Customer Chats</h3>

      {chats.length === 0 ? (
        <p>No active chats</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            className={`chat-card ${chat.status}`}
            onClick={() => setCurrentChat(chat)}
          >
            <div className="chat-info">
              <h4>{chat.name}</h4>
              <p>{chat.email}</p>
            </div>
            <span className={`status ${chat.status}`}>
              {chat.status === "active" ? "Active" : "Ended"}
            </span>
          </div>
        ))
      )}

      <ChatRequestModal
        visible={!!incomingRequest}
        customer={incomingRequest}
        onAccept={() => acceptChat(incomingRequest)}
        onReject={rejectChat}
      />
    </aside>
  );
};

export default Sidebar;
