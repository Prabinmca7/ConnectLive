import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/Sidebar.css";

const Sidebar = ({ setCurrentChat }) => {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-request", (data) => {
      setRequests((prev) => [...prev, data.customer]);
    });

    return () => socket.off("chat-request");
  }, [socket]);

  const acceptChat = (customer) => {
    if (!socket) return;
  console.log("Accepting chat from:", customer.socketId);
  socket.emit("accept-chat", { customerId: customer.socketId });
  setCurrentChat(customer);
  setRequests([]);
  };

  return (
    <aside className="sidebar">
      <h3>Incoming Requests</h3>
      {requests.length === 0 ? (
        <p>No requests</p>
      ) : (
        requests.map((req, i) => (
          <button key={i} onClick={() => acceptChat(req)}>
            {req.name}
          </button>
        ))
      )}
    </aside>
  );
};

export default Sidebar;