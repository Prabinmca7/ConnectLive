import React from "react";
import "../styles/Modal.css";

const ChatHistoryModal = ({ visible, messages, onClose }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h3>Chat History</h3>
        <div className="history-list">
          {messages.length === 0 ? (
            <p>No previous messages</p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="history-msg">
                <strong>{m.from}:</strong> {m.message}
              </div>
            ))
          )}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
