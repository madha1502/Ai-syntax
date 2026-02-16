import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* =========================================================
   NORMAL LEADERBOARD
========================================================= */
router.get("/", async (req, res) => {
  try {

    const users = await User.find()
      .sort({ total: -1 })
      .select(
        "name teamId round1 round2 round3 total round2FileUrl round3VideoUrl"
      );

    /* 🔥 ADD RANK AUTOMATICALLY */
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      ...u.toObject()
    }));

    res.json(ranked);

  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================================================
   LIVE LEADERBOARD  (Server Sent Events)
========================================================= */
router.get("/live", async (req, res) => {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendData = async () => {
    try {

      const users = await User.find()
        .sort({ total: -1 })
        .select(
          "name teamId round1 round2 round3 total round2FileUrl round3VideoUrl"
        );

      const ranked = users.map((u, i) => ({
        rank: i + 1,
        ...u.toObject()
      }));

      res.write(`data: ${JSON.stringify(ranked)}\n\n`);

    } catch (err) {
      console.error("Live Leaderboard Error:", err);
    }
  };

  /* 🔥 SEND FIRST DATA */
  sendData();

  /* 🔥 AUTO UPDATE EVERY 3 SEC */
  const interval = setInterval(sendData, 3000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
