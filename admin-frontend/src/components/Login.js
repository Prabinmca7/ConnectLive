import React, { useState } from 'react';
import './login.css';
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ user: '', pass: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.user === 'admin' && credentials.pass === 'admin') {
      onLogin();
    } else {
      alert("Invalid credentials. Try admin / admin");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">FineChat</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              onChange={e =>
                setCredentials({ ...credentials, user: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              onChange={e =>
                setCredentials({ ...credentials, pass: e.target.value })
              }
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="login-footer">
          <span>Demo credentials: <b>admin / admin</b></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
