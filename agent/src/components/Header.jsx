import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaCircle } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import "../styles/Header.css";

const Header = ({ agent, onLogout }) => {
  const socket = useSocket();
  const [online, setOnline] = useState(false);

  const toggleOnline = () => {
    if (online) {
      socket.emit("agent-offline");
    } else {
      socket.emit("agent-online", { name: agent.username });
    }
    setOnline(!online);
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