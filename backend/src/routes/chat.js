import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import Chat from "../models/Chat.js";

dotenv.config();

const router = express.Router();

const openaiClient = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.github.ai/inference"
});

router.post("/", async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
  return res.status(400).json({ error: "Valid messages required" });
}

    // 🔥 MULTI-MODEL SWITCH
    let selectedModel = "openai/gpt-4o";

    const allowedModels = ["gpt", "gpt41", "deepseek", "grok", "llama"];

if (model && !allowedModels.includes(model)) {
  return res.status(400).json({ error: "Invalid model selected" });
}

switch (model) {
  case "deepseek":
    selectedModel = "deepseek/DeepSeek-V3-0324";
    break;

  case "grok":
    selectedModel = "xai/grok-3-mini";
    break;

  case "llama":
    selectedModel = "meta/Llama-4-Scout-17B-16E-Instruct";
    break;

  case "gpt41":
    selectedModel = "openai/gpt-4.1";
    break;

  default:
    selectedModel = "openai/gpt-4o";
}

    const response = await openaiClient.chat.completions.create({
      model: selectedModel,
      messages,
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;

    // 💾 Save chat
    await Chat.create({
      model: model || "gpt",
      messages: [...messages, { role: "assistant", content: reply }]
    });

    res.json({ reply });

  } catch (err) {
    console.error("ERROR:", err);

res.status(500).json({
  error: "Internal Server Error",
  details: err.message
});
  }
});

export default router;
