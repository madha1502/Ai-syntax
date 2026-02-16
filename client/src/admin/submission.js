import express from "express";
import User from "../models/User.js";
import Round from "../models/Round.js";

const router = express.Router();

/* ============================= */
/* 🔐 CHECK ROUND LOCK HELPER */
/* ============================= */
const checkRoundLock = async (roundNumber) => {
  const round = await Round.findOne();
  if (!round) return true;

  if (roundNumber === 1) return round.round1Locked;
  if (roundNumber === 2) return round.round2Locked;
  if (roundNumber === 3) return round.round3Locked;

  return true;
};

/* ============================= */
/* 🔥 SUBMIT ROUND ANSWER */
/* ============================= */
router.post("/submit", async (req, res) => {
  try {
    const { teamId, prompt } = req.body;
    const round = Number(req.body.round);

    if (!teamId || !prompt || !round) {
      return res.status(400).json({
        message: "teamId, prompt and round are required"
      });
    }

    const user = await User.findOne({ teamId });

    if (!user) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (user.eliminated) {
      return res.status(403).json({
        message: "Team is eliminated"
      });
    }

    const roundData = await Round.findOne();

    if (!roundData) {
      return res.status(500).json({
        message: "Round not initialized"
      });
    }

    /* 🔒 INDIVIDUAL ROUND LOCK CHECK */
    const isLocked = await checkRoundLock(round);

    if (isLocked) {
      return res.status(403).json({
        message: `Round ${round} is locked by Admin`
      });
    }

    /* ✅ CHECK CURRENT ROUND */
    if (round !== roundData.currentRound) {
      return res.status(403).json({
        message: "Wrong round"
      });
    }

    /* ⏰ CHECK TIME */
    if (
      roundData.roundEndTime &&
      new Date() > new Date(roundData.roundEndTime)
    ) {
      return res.status(403).json({
        message: "Round time ended"
      });
    }

    /* 🧠 SCORE PROMPT */
    const score = scorePrompt(prompt);

    if (round === 1) user.round1 = score;
    if (round === 2) user.round2 = score;
    if (round === 3) user.round3 = score;

    user.total =
      (user.round1 || 0) +
      (user.round2 || 0) +
      (user.round3 || 0);

    await user.save();

    res.json({
      message: "Submission successful",
      score,
      total: user.total
    });

  } catch (error) {
    console.error("🔥 Submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================= */
/* 🔥 AI Prompt Scoring */
/* ============================= */
function scorePrompt(prompt) {
  let score = 0;

  const length = prompt.length;
  if (length > 300) score += 20;
  else if (length > 200) score += 15;
  else if (length > 120) score += 10;
  else score += 5;

  const keywords = [
    "emotion", "lighting", "cinematic", "realistic",
    "high detail", "dramatic", "atmosphere",
    "shadow", "depth", "intense", "mood"
  ];

  keywords.forEach(word => {
    if (prompt.toLowerCase().includes(word)) {
      score += 5;
    }
  });

  if (prompt.includes(",")) score += 5;
  if (prompt.includes(" and ")) score += 5;
  if (prompt.split(" ").length > 40) score += 10;

  return Math.min(score, 100);
}

export default router;
