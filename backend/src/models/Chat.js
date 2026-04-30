import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
});


const chatSchema = new mongoose.Schema({
  model: {
    type: String,
    default: "gpt"
  },
  userId: {
    type: String,
    default: "anonymous"
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Chat", chatSchema);