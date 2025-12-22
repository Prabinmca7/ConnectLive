import React from 'react';
import { Users, CheckCircle, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Agents', value: '12', icon: <Users />, color: '#3b82f6' },
    { label: 'Chats Completed', value: '1,240', icon: <CheckCircle />, color: '#10b981' },
    { label: 'Active Chats', value: '45', icon: <MessageSquare />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-view">
      <h1 className="view-title">Dashboard Overview</h1>
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}