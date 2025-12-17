import React from "react";
import "../styles/Chat.css";
import { FaPhoneAlt, FaVideo, FaPaperclip, FaDesktop, FaSignOutAlt } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";


const ChatHeader = ({ onLogout }) => {
  return (
    <header className="chat-header">
      <h3>Chat with Support</h3>
      <div className="chat-actions">
        <FaPhoneAlt title="Audio Call" />
        <FaVideo title="Video Call" />
        <FaDesktop title="Screen Share" />
        <FaPaperclip title="Attach File" />
        {/* Logout Button */}
        <IoMdLogOut 
          className="user-logout-btn"
          onClick={onLogout}
          title="Logout"
        />
          
      
      </div>
    </header>
  );
};

export default ChatHeader;
