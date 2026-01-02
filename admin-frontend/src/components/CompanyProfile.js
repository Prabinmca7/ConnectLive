import React, { useState, useEffect } from 'react';
import { Building2, User, Key, Users, Trash2, Edit2, X } from 'lucide-react';
import api from '../utils/api';

const CompanyProfile = ({ user }) => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: '',
    allowedAgents: 5
  });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
        const res = await api.get(`/api/companies`);
      setCompanies(res.data);
    } catch (err) {
      console.error("Error fetching companies", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic requires super-admin role for backend validation
      const payload = { ...formData, requesterRole: 'admin' };
      
      if (editingId) {
        await api.put(`/api/companies/${editingId}`, payload);
      } else {
        await api.post(`/api/companies/create`, payload);
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ companyName: '', username: '', password: '', allowedAgents: 5 });
      fetchCompanies();
    } catch (err) {
        console.log(err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (company) => {
    setEditingId(company._id);
    setFormData({
      companyName: company.companyName,
      username: company.username,
      password: '',
      allowedAgents: company.allowedAgents
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will delete the company and all its agents.")) {
      await api.delete(`/api/companies/${id}`);
      fetchCompanies();
    }
  };

  return (
    <div className="agents-view">
      <div className="view-header">
        <h1 className="view-title">Company Profiles</h1>
        <button className="primary-btn" onClick={() => { setEditingId(null); setShowModal(true); }}>
          + Add New Company
        </button>
      </div>

      <div className="card">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Admin Username</th>
              <th>Agent Limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id}>
                <td>
                  <div className="agent-info">
                    <div className="avatar">{c.companyName.charAt(0)}</div>
                    <span style={{ fontWeight: 600 }}>{c.companyName}</span>
                  </div>
                </td>
                <td>{c.username}</td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={16} color="#6b7280" /> {c.allowedAgents}
                    </div>
                </td>
                <td>
                  <span className="status active">Active</span>
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(c)}><Edit2 size={18} color="#2563eb" /></button>
                  <button onClick={() => handleDelete(c._id)}><Trash2 size={18} color="#f87171" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="view-header" style={{ marginBottom: '15px' }}>
              <h3>{editingId ? 'Edit Company' : 'New Company Profile'}</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            
            <form className="agent-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  placeholder="Company Name" 
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  placeholder="Admin Username" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Admin Password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '12px', color: '#6b7280', marginLeft: '5px' }}>Allowed Agents</label>
                <input 
                  type="number" 
                  value={formData.allowedAgents}
                  onChange={e => setFormData({...formData, allowedAgents: e.target.value})}
                  required 
                />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? 'Update Profile' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;