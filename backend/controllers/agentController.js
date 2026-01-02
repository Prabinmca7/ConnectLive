import Agent from "../models/Agent.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ================= REGISTER ================= */
export const registerAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Agent.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const agent = await Agent.create({ name, email, password });

    res.json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      token: generateToken(agent._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });

    if (agent && (await agent.comparePassword(password))) {
      res.json({
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        token: generateToken(agent._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= TOGGLE STATUS ================= */
export const toggleOnlineStatus = async (req, res) => {
  const agent = await Agent.findById(req.user._id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });

  agent.online = !agent.online;
  await agent.save();

  res.json({
    message: `Agent is now ${agent.online ? "online" : "offline"}`,
    online: agent.online,
  });
};

/* ================= GET AGENTS (🔥 MISSING EXPORT) ================= */
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .select("-password")
      .sort({ online: -1, createdAt: -1 });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
