const mongoose = require('mongoose');

const FlowSchema = new mongoose.Schema({
  name: { type: String, default: "Untitled Flow" },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  viewport: { type: Object }, // Stores zoom level and position
  lastSaved: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flow', FlowSchema);