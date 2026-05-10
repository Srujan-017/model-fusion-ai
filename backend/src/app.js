import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://model-fusion-ai.vercel.app",
  ...configuredOrigins,
]);

const corsOptions = {
  origin(origin, callback) {
    const isVercelApp = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || "");

    if (!origin || allowedOrigins.has(origin) || isVercelApp) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
};

connectDB();

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "ModelFusion AI API" });
});

app.get("/", (req, res) => {
  res.send("ModelFusion AI API running.");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
