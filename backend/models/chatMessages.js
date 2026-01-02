import mongoose from "mongoose";

const ChatNodeSchema = new mongoose.Schema({
    noteId: { type: String, unique: true },
    chatId: { type: String, index: true },
    messageType: { type: String, enum: ["agent", "user"] },
    from: { type: String, enum: ["agent", "user"] },
    to: { type: String, enum: ["agent", "user"] },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatMessage", ChatNodeSchema);
