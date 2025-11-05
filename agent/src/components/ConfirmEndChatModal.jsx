import React from "react";
import "../styles/Modal.css";

const ConfirmEndChatModal = ({ visible, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content small">
        <h3>End Chat?</h3>
        <p>Are you sure you want to disconnect this chat?</p>
        <div className="modal-actions">
          <button className="reject" onClick={onConfirm}>Yes, End</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndChatModal;
