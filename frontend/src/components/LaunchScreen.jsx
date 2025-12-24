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



  };


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


          <button type="submit">Start Chat</button>
        </form>


      </div>
    </div>
  );
};

export default LaunchScreen;