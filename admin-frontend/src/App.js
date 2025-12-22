import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Agents from './components/Agents';
import ChatBotBuilder from './components/ChatBotBuilder';
import ChatHistory from './components/ChatHistory';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={
          !isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />
        } />

        {/* Protected Dashboard Layout */}
        <Route path="/" element={
          isAuthenticated ? <Layout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="builder" element={<ChatBotBuilder />} />
          <Route path="history" element={<ChatHistory />} />
          <Route path="settings" element={<div>Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}