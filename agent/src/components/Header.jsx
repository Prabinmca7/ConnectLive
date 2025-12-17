import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt, FaCircle } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import "../styles/Header.css";

const Header = ({ agent, onLogout }) => {
  const socket = useSocket();
  const [online, setOnline] = useState(true);

  // Notify backend when component mounts
  useEffect(() => {
    if (socket) {
      socket.emit("agent-online", { name: agent.username });
      setOnline(true);
    }
  }, [socket, agent.username]);

  const toggleOnline = () => {
    const newStatus = !online;
    setOnline(newStatus);

    if (socket) {
      if (newStatus) {
        socket.emit("agent-online", { name: agent.username });
      } else {
        socket.emit("agent-offline");
      }
    }
  };

  return (
    <header className="header">
      <div className="left">
        <FaUserCircle size={24} /> <span>{agent.username}</span>
      </div>
      <div className="right">
        <button onClick={toggleOnline} className="status-btn">
          <FaCircle color={online ? "green" : "gray"} />{" "}
          {online ? "Online" : "Offline"}
        </button>
        <button onClick={onLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
