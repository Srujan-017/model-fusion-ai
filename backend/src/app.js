import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean)
  : true;

connectDB();

app.use(cors({ origin: allowedOrigins }));
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
