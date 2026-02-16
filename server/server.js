import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import http from "http";
import { Server } from "socket.io";
import os from "os";   // ✅ ADDED (for auto IP detection)

import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import submissionRoutes from "./routes/submission.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import roundRoutes from "./routes/round.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= GET LOCAL NETWORK IP ================= */
// ✅ ADDED FUNCTION (Nothing removed)
function getLocalIP() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

/* ================= IMAGE PROXY ================= */

app.get("/api/generate-image", async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  try {
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
      timeout: 30000
    });

    if (!response.headers['content-type'] || !response.headers['content-type'].includes('image')) {
      throw new Error("Invalid response content type");
    }

    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);

  } catch (error) {
    console.error("🔥 Pollinations error:", error.message);

    try {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      const fallbackResponse = await axios({
        url: fallbackUrl,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      res.setHeader("Content-Type", fallbackResponse.headers["content-type"]);
      fallbackResponse.data.pipe(res);

    } catch (fallbackError) {
      console.error("🔥 Fallback also failed:", fallbackError.message);
      res.status(500).json({ error: "Image generation failed. Please try again later." });
    }
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Kanal Studio Server Running Successfully");
});

/* ================= DATABASE CONNECTION ================= */

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB Connected");

    /* ================= ROUTES ================= */

    app.use("/api/auth", authRoutes);
    app.use("/api/submission", submissionRoutes);
    app.use("/api/leaderboard", leaderboardRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/round", roundRoutes);

    /* ================= START SERVER ================= */

    server.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on port", PORT);
      console.log(`👉 Local:   http://localhost:${PORT}`);
      console.log(`👉 Network: http://${getLocalIP()}:${PORT}`);  // ✅ AUTO IP
    });

  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
  });
