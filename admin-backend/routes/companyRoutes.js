const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Agent = require('../models/Agent');
const crypto = require('crypto');

// CREATE a company profile
router.post('/create', async (req, res) => {
  const { companyName, username, password, allowedAgents } = req.body;
  try {
    const company = new Company({
      companyName,
      username,
      password, // Note: In production, hash this with bcrypt
      allowedAgents: Number(allowedAgents) || 5
    });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: "Error creating company", error: err.message });
  }
});

// LIST all company profiles
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching companies" });
  }
});

// UPDATE a company profile
router.put('/:id', async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedCompany);
  } catch (err) {
    res.status(500).json({ message: "Error updating company" });
  }
});

// DELETE a company profile and all its agents
router.delete('/:id', async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    await Agent.deleteMany({ companyId: req.params.id }); // Clean up agents
    res.json({ message: "Company and its agents deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting company" });
  }
});

// Generate and save API Key
router.post('/generate-api-key', async (req, res) => {
  const { companyId } = req.body;
  try {
    // Generate a secure random 32-character hex string
    const newKey = `fc_${crypto.randomBytes(16).toString('hex')}`;
    
    const company = await Company.findByIdAndUpdate(
      companyId,
      { apiKey: newKey },
      { new: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json({ apiKey: company.apiKey });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get current API Key
router.get('/:companyId/api-key', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    res.json({ apiKey: company?.apiKey || null });
  } catch (err) {
    res.status(500).json({ message: "Error fetching key" });
  }
});

// verify-key
router.get('/verify-key', async (req, res) => {
  const { apiKey } = req.query;
  try {
    const company = await Company.findOne({ apiKey });
    if (company) {
      return res.json({ valid: true, companyName: company.companyName });
    }
    res.status(401).json({ valid: false, message: "Invalid API Key" });
  } catch (err) {
    res.status(500).json({ valid: false });
  }
});

module.exports = router;