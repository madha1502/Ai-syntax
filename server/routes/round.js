import express from "express";
import Round from "../models/Round.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let round = await Round.findOne();

    if (!round) {
      round = await Round.create({
        currentRound: 1,
        round1Locked: false,
        round2Locked: false,
        round3Locked: false
      });
    }

    res.json({
      currentRound: round.currentRound,
      round1Locked: round.round1Locked,
      round2Locked: round.round2Locked,
      round3Locked: round.round3Locked
    });

  } catch (err) {
    console.error("Round Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/generate-image", async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  const imageUrl =
  "https://image.pollinations.ai/prompt/" +
  encodeURIComponent(prompt) +
  "?model=flux&width=512&height=512&seed=" +
  Date.now();

  res.json({ imageUrl });
});

export default router;
