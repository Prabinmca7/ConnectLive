import React, { useState } from "react";
import "../styles/LoginForm.css";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin({ username });
    } else {
      alert("Please enter both username and password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
      <h1 className="logo">🎧 Live Support Desk</h1>
        <p className="subtitle">Welcome back! Please sign in to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <footer>
          <small>© {new Date().getFullYear()} Live Support Portal</small>
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;
