const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Flow = require('../models/Flow');

// SAVE or UPDATE a flow
router.post('/save', async (req, res) => {
  // Destructure EVERYTHING sent from the frontend
  const { id, companyId, createdBy, nodes, edges, viewport, name } = req.body;
  
  try {
    // 1. Define the selection query
    // If we have a specific flow ID, use it. 
    // Otherwise, find the flow associated with this company.
    const query = id ? { _id: id } : { companyId: companyId };

    // 2. Define the data to save
    const update = { 
      nodes, 
      edges, 
      viewport, 
      name, 
      companyId,   // CRITICAL: Ensure this is saved
      createdBy,   // CRITICAL: Ensure this is saved
      lastSaved: Date.now() 
    };

    // 3. Upsert logic: Update if found, Create if not
    const flow = await Flow.findOneAndUpdate(query, update, { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    });
    
    res.status(200).json(flow);
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ message: "Error saving flow", error: err.message });
  }
});

// GET flow by Company ID (Corrected to handle empty results)
router.get('/company/:companyId', async (req, res) => {
  try {
    const flow = await Flow.findOne({ companyId: req.params.companyId });
    // If no flow exists yet, return an empty object or 204 instead of an error
    res.json(flow || {}); 
  } catch (err) {
    res.status(500).json({ message: "Error loading flow" });
  }
});

// GET a specific flow by ID (Keep for individual flow access if needed)
router.get('/:id', async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    if (!flow) return res.status(404).json({ message: "Flow not found" });
    res.json(flow);
  } catch (err) {
    res.status(500).json({ message: "Error fetching flow" });
  }
});

module.exports = router;