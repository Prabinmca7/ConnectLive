import React, { useState, useEffect } from 'react';
import { MessageCircle, X, AlertTriangle } from 'lucide-react';
import ChatWindow from "./ChatWindow";
import axios from 'axios';
import './ChatWidget.css';

const ChatWidgetView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "Guest" }); // default guest user

  const [isValidKey, setIsValidKey] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyApiKey = async () => {
      const params = new URLSearchParams(window.location.search);
      const apiKey = params.get('apiKey');

      if (!apiKey) {
        setIsValidKey(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/companies/verify-key?apiKey=${apiKey}`);
        setIsValidKey(response.data.valid);
      } catch (err) {
        setIsValidKey(false);
      } finally {
        setLoading(false);
      }
    };

    verifyApiKey();
  }, [API_BASE_URL]);

  // Handle iframe resizing
  useEffect(() => {
    const message = isOpen ? 'openChat' : 'closeChat';
    window.parent.postMessage(message, '*');
  }, [isOpen]);

  if (loading) return null;

  if (isValidKey === false) {
    return (
      <div className="finechat-invalid-key">
        <AlertTriangle color="#ef4444" size={20} />
        <span>Invalid API Key - Please check configuration</span>
      </div>
    );
  }

  return (
    <div className={`finechat-widget-wrapper ${isOpen ? 'is-open' : 'is-closed'}`}>
      {isOpen && (
        <div className="chat-window-container">
          <div className="chat-header">
            <div className="header-info">
              <div className="online-indicator"></div>
              <span>Live Support</span>
            </div>
            <button className="close-window-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-body">
            <ChatWindow user={user} /> {/* Open chat immediately */}
          </div>
        </div>
      )}

      <button
        className={`chat-launcher-btn ${isOpen ? 'btn-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={30} /> : <MessageCircle size={30} />}
      </button>
    </div>
  );
};

export default ChatWidgetView;
