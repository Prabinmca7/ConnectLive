import express from "express";
import ChatMessage from "../models/chatMessages.js";

const router = express.Router();

router.get("/:chatId", async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            chatId: req.params.chatId
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
