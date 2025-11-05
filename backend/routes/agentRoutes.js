import express from "express";
import { registerAgent, loginAgent, toggleOnlineStatus } from "../controllers/agentController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAgent);
router.post("/login", loginAgent);
router.put("/status", protect, toggleOnlineStatus);

export default router;