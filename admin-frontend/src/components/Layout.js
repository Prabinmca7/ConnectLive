import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Workflow,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Layout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <aside className={`sidebar-nav ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Logo + Toggle */}
        <div className="sidebar-header">
          {!isCollapsed && <div className="sidebar-logo">FineChat</div>}
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/agents" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            {!isCollapsed && <span>Agents</span>}
          </NavLink>

          <NavLink to="/builder" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Workflow size={20} />
            {!isCollapsed && <span>ChatBot Builder</span>}
          </NavLink>

          <NavLink to="/history" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <History size={20} />
            {!isCollapsed && <span>Chat History</span>}
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>

        <div
          className="nav-item logout"
          onClick={handleLogout}
          style={{ marginTop: 'auto', color: '#f87171' }}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </div>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
