import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/LaunchScreen.css";

const LaunchScreen = ({ onChatStart }) => {
  const socket = useSocket();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
  });
  const [status, setStatus] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, subject } = formData;
    if (!name || !email || !phone || !subject) {
      alert("Please fill all fields");
      return;
    }

    // Immediately start chat, skip agent check
    onChatStart(formData, null);


    // Send request to backend
    // setStatus("Checking for available agents...");
    // setIsWaiting(true);
    // socket.emit("customer-request", formData);
  };

  // Attach listeners once when socket connects
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleNoAgents = (msg) => {
  //     setStatus(msg);
  //     setIsWaiting(false);
  //   };

  //   const handleChatAccepted = ({ agentId }) => {
  //     console.log("Chat accepted by agent:", agentId);
  //     setStatus(""); // ✅ clear message
  //     setIsWaiting(false);
  //     onChatStart(formData, agentId); // ✅ move to chat window
  //   };

  //   socket.on("no-agents", handleNoAgents);
  //   socket.on("chat-accepted", handleChatAccepted);

  //   return () => {
  //     socket.off("no-agents", handleNoAgents);
  //     socket.off("chat-accepted", handleChatAccepted);
  //   };
  // }, [socket]); // ✅ do NOT include formData or onChatStart in dependencies

  return (
    <div className="launch-screen">
      <div className="form-container">
        <h2>Welcome to Live Chat</h2>
        <p>Please fill your details to start</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
          />
          {/* <button type="submit" disabled={isWaiting}>
            {isWaiting ? "Waiting..." : "Start Chat"}
          </button> */}

          <button type="submit">Start Chat</button>
        </form>

        {/* {status && (
          <p
            className={`status ${status.includes("No agents") ? "error" : "info"
              }`}
          >
            {status}
          </p>
        )} */}
      </div>
    </div>
  );
};

export default LaunchScreen;