import express from "express";
import dynamicChatResponse from "../api/chat-dynamic.js";

const router = express.Router();

router.post("/dynamic", dynamicChatResponse);

export default router;