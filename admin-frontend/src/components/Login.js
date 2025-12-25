import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

const Login = ({ onLogin }) => {
  // Use 'username' and 'password' to match backend expected keys
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to the unified login route
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      // Pass the whole user object (role, companyId, etc.) to App.js
      onLogin(response.data);
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">FineChat</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={credentials.username}
              required
              onChange={e =>
                setCredentials({ ...credentials, username: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={credentials.password}
              required
              onChange={e =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
           <p>Login as Super Admin, Company, or Agent</p>
        </div>
      </div>
    </div>
  );
};

export default Login;