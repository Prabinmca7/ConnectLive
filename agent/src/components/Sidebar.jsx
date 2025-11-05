import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/Sidebar.css";
import ChatRequestModal from "./ChatRequestModal";

const Sidebar = ({ setCurrentChat }) => {
  const socket = useSocket();
  const [chats, setChats] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);

  // ✅ Fetch chats from backend (or mock for now)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Temporary mock data
        const data = [
          {
            _id: "674c59",
            name: "John Doe",
            email: "john@example.com",
            status: "ended",
            messages: [],
            socketId: "mock123", // 👈 important for sending messages
          },
        ];
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, []);

  // 🧠 Listen for new chat requests (from customers)
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-request", (data) => {
      console.log("📩 New chat request from:", data.customer);
      setIncomingRequest(data.customer);
    });

    return () => socket.off("chat-request");
  }, [socket]);

  // ✅ Accept incoming chat request
  const acceptChat = async (customer) => {
    if (!socket || !customer) return;

    console.log("✅ Accepting chat from:", customer.socketId);

    // Inform backend which customer was accepted
    socket.emit("accept-chat", { customerId: customer.socketId });

    // Create chat object that includes socketId (for messaging)
    const newChat = {
      _id: customer.socketId, // Use socketId as temp unique key
      name: customer.name,
      email: customer.email,
      subject: customer.subject || "Support Request",
      status: "active",
      socketId: customer.socketId, // 👈 needed for messaging
      messages: [],
    };

    // Optional: save to DB (you can keep it later)
    try {
      await fetch("http://localhost:4000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChat),
      });
    } catch (err) {
      console.warn("⚠️ Could not save chat to DB yet:", err.message);
    }

    // Update sidebar
    setChats((prev) => [newChat, ...prev]);

    // 🧠 VERY IMPORTANT — pass socketId to ChatWindow
    setCurrentChat(newChat);

    // Close popup
    setIncomingRequest(null);
  };

  const rejectChat = () => {
    console.log("❌ Chat request rejected");
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

      {/* 💬 New chat request popup */}
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
