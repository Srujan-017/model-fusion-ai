import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";

dotenv.config();

const router = express.Router();

const MODEL_MAP = {
  gpt: "openai/gpt-4o",
  gpt41: "openai/gpt-4.1",
  deepseek: "deepseek/DeepSeek-V3-0324",
  grok: "xai/grok-3-mini",
  llama: "meta/Llama-4-Scout-17B-16E-Instruct",
};

const VISION_MODELS = new Set(["gpt", "gpt41"]);
const VALID_ROLES = new Set(["system", "user", "assistant"]);

const getOpenAIClient = () => new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.github.ai/inference",
});

const sanitizeMessages = (messages, image) => {
  const cleanMessages = messages
    .filter(message => VALID_ROLES.has(message?.role) && typeof message?.content === "string")
    .map(message => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter(message => message.content.length > 0);

  if (!image) {
    return cleanMessages;
  }

  const lastUserIndex = cleanMessages.findLastIndex(message => message.role === "user");
  if (lastUserIndex === -1) {
    return cleanMessages;
  }

  cleanMessages[lastUserIndex] = {
    ...cleanMessages[lastUserIndex],
    content: [
      { type: "text", text: cleanMessages[lastUserIndex].content },
      { type: "image_url", image_url: { url: image } },
    ],
  };

  return cleanMessages;
};

router.post("/", async (req, res) => {
  try {
    const { messages, model = "gpt", image } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Valid messages required" });
    }

    if (!MODEL_MAP[model]) {
      return res.status(400).json({ error: "Invalid model selected" });
    }

    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: "GITHUB_TOKEN is not configured on the server." });
    }

    if (image && !String(image).startsWith("data:image/")) {
      return res.status(400).json({ error: "Image must be a data URL." });
    }

    if (image && !VISION_MODELS.has(model)) {
      return res.status(400).json({ error: "Image upload is available only with GPT-4o or GPT-4.1." });
    }

    const cleanMessages = sanitizeMessages(messages, image);

    if (cleanMessages.length === 0) {
      return res.status(400).json({ error: "Messages cannot be empty." });
    }

    const openaiClient = getOpenAIClient();
    const response = await openaiClient.chat.completions.create({
      model: MODEL_MAP[model],
      messages: cleanMessages,
      max_tokens: 500,
    });

    const reply = response.choices?.[0]?.message?.content || "";

    if (!reply) {
      return res.status(502).json({ error: "The model returned an empty response." });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await Chat.create({
          model,
          messages: [...messages, { role: "assistant", content: reply }],
        });
      } catch (saveError) {
        console.warn("Chat save failed:", saveError.message);
      }
    }

    res.json({ reply });
  } catch (err) {
    const isConnectionError = err?.name === "APIConnectionError" || err?.message === "Connection error.";
    const statusCode = isConnectionError ? 502 : (err?.status || 500);
    const details = isConnectionError
      ? "Backend could not connect to GitHub Models. Check your internet connection, firewall/VPN, and that https://models.github.ai is reachable."
      : err.message;

    console.error("Chat route error:", details);

    res.status(statusCode).json({
      error: isConnectionError ? "GitHub Models connection failed" : "Internal Server Error",
      details,
    });
  }
});

export default router;
