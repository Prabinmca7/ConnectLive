import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2, // Icon for Company Profile
  Workflow,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const Layout = ({ onLogout, user }) => {
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

        {/* User Info Badge */}
        {!isCollapsed && (
          <div className="user-info-badge" style={{ padding: '0 20px 20px', fontSize: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
                <ShieldCheck size={14} />
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{user?.role}</span>
             </div>
             <div style={{ color: '#9ca3af', marginTop: '4px' }}>{user?.username}</div>
          </div>
        )}

        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* NEW: Company Profile Link - Visible ONLY to Super Admin */}
          {user?.role === 'super-admin' && (
            <NavLink to="/companies" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Building2 size={20} />
              {!isCollapsed && <span>Company Profiles</span>}
            </NavLink>
          )}

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