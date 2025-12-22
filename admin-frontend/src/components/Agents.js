import React, { useState } from "react";
import './Agent.css';
const initialAgents = [
  {
    id: 1,
    name: "John Doe",
    username: "john",
    email: "john@finechat.com",
    contact: "+1 234 567 890",
    status: "active",
    avatar: ""
  }
];

export default function Agents() {
  const [agents, setAgents] = useState(initialAgents);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const openCreate = () => {
    setEditingAgent(null);
    setShowModal(true);
  };

  const openEdit = (agent) => {
    setEditingAgent(agent);
    setShowModal(true);
  };

  const deleteAgent = (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setAgents(agents.filter((a) => a.id !== id));
    }
  };

  const saveAgent = (e) => {
    e.preventDefault();
    const form = e.target;

    const newAgent = {
      id: editingAgent ? editingAgent.id : Date.now(),
      name: form.name.value,
      username: form.username.value,
      email: form.email.value,
      contact: form.contact.value,
      status: form.status.value,
      avatar: ""
    };

    if (editingAgent) {
      setAgents(
        agents.map((a) => (a.id === editingAgent.id ? newAgent : a))
      );
    } else {
      setAgents([...agents, newAgent]);
    }

    setShowModal(false);
  };

  return (
    <div className="agents-view">
      <div className="view-header">
        <h1>Agents Management</h1>
        <button className="primary-btn" onClick={openCreate}>
          + Create Agent
        </button>
      </div>

      <div className="card">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="agent-info">
                  <div className="avatar">
                    {agent.name.charAt(0)}
                  </div>
                  <span>{agent.name}</span>
                </td>
                <td>{agent.username}</td>
                <td>{agent.email}</td>
                <td>
                  <span className={`status ${agent.status}`}>
                    {agent.status === "active" ? "Active" : "Deactive"}
                  </span>
                </td>
                <td>{agent.contact}</td>
                <td className="actions">
                  <button onClick={() => openEdit(agent)}>✏️</button>
                  <button onClick={() => deleteAgent(agent.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingAgent ? "Edit Agent" : "Create Agent"}</h2>

            <form onSubmit={saveAgent} className="agent-form">
              <input name="name" defaultValue={editingAgent?.name} placeholder="Full Name" required />
              <input name="username" defaultValue={editingAgent?.username} placeholder="Username" required />
              <input name="email" type="email" defaultValue={editingAgent?.email} placeholder="Email" required />
              <input name="password" type="password" placeholder="Password" />
              <input name="contact" defaultValue={editingAgent?.contact} placeholder="Contact Number" />
              
              <select name="status" defaultValue={editingAgent?.status || "active"}>
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
