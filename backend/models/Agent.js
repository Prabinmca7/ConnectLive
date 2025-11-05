import mongoose from "mongoose";
import bcrypt from "bcrypt";

const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  online: { type: Boolean, default: false },
});

agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

agentSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Agent", agentSchema);