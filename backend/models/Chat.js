import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        chatId: { type: String, unique: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
        agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },
        status: { type: String, enum: ["running", "ended"], default: "running" },
        endedBy: {
            type: String,
            enum: ["auto_disconnected", "agent", "user"],
            default: null
        },
        startedAt: { type: Date, default: Date.now },
        endedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
