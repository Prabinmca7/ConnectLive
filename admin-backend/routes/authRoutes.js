// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Agent = require('../models/Agent');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. UPDATED: Specific Super Admin Credentials
  if (username === 'superadmin' && password === 'prabin@123') {
    return res.json({ 
      role: 'super-admin', 
      username: 'System Owner',
      companyId: null 
    });
  }

  // 2. Check Company Admin Table
  const company = await Company.findOne({ username, password });
  if (company) {
    return res.json({ 
      role: 'admin', 
      companyId: company._id, 
      companyName: company.companyName,
      username: company.username 
    });
  }

  // 3. Check Agent Table
  const agent = await Agent.findOne({ username, password });
  if (agent) {
    return res.json({ 
      role: 'agent', 
      companyId: agent.companyId, 
      username: agent.username 
    });
  }

  res.status(401).json({ message: "Invalid username or password" });
});

module.exports = router;