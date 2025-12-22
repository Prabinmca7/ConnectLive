const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Flow = require('../models/Flow');

// SAVE or UPDATE a flow
router.post('/save', async (req, res) => {
  const { id, nodes, edges, viewport, name } = req.body;
  try {
    // If id exists, update; otherwise create new
    const query = id ? { _id: id } : { _id: new mongoose.Types.ObjectId() };
    const update = { nodes, edges, viewport, name, lastSaved: Date.now() };
    
    const flow = await Flow.findOneAndUpdate(query, update, { 
      upsert: true, 
      new: true 
    });
    
    res.status(200).json(flow);
  } catch (err) {
    res.status(500).json({ message: "Error saving flow", error: err.message });
  }
});

// GET a specific flow by ID
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