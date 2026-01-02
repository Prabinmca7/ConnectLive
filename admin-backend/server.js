require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
 

// Import Routes
const flowRoutes = require('./routes/flowRoutes');
const companyRoutes = require('./routes/companyRoutes'); // New
const agentRoutes = require('./routes/agentRoutes');   // New
const authRoutes = require('./routes/authRoutes');     // New

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/agents', agentRoutes);



// Global Stats Route (for Dashboard)
app.get('/api/stats/super', async (req, res) => {
    try {
        const Company = require('./models/Company');
        const Agent = require('./models/Agent');
        const companyCount = await Company.countDocuments();
        const agentCount = await Agent.countDocuments();
        res.json({ companyCount, agentCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/company/:id', async (req, res) => {
    try {
        const Company = require('./models/Company');
        const Agent = require('./models/Agent');
        const Flow = require('./models/Flow');
        
        const company = await Company.findById(req.params.id);
        const currentAgents = await Agent.countDocuments({ companyId: req.params.id });
        const flowCount = await Flow.countDocuments({ companyId: req.params.id });
        
        res.json({
            currentAgents,
            allowedAgents: company.allowedAgents,
            flowCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));