import React from "react";
import "../styles/Modal.css";

const ChatRequestModal = ({ visible, customer, onAccept, onReject }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>New Chat Request</h3>
        <p><strong>{customer.name}</strong> wants to start a chat.</p>
        <p>Subject: {customer.subject}</p>

        <div className="modal-actions">
          <button className="accept" onClick={onAccept}>Accept</button>
          <button className="reject" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default ChatRequestModal;
