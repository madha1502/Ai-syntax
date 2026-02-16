import express from "express";
import User from "../models/User.js";
import Round from "../models/Round.js";
import stringSimilarity from "string-similarity";

/* NOTE: express imported once only */
const router = express.Router();

/* ================= FRAUD CHECK FUNCTIONS ================= */

const checkPromptSimilarity = async (prompt) => {
  const users = await User.find({ round1Prompt: { $ne: null } });

  for (let u of users) {
    const similarity = stringSimilarity.compareTwoStrings(
      prompt.toLowerCase(),
      (u.round1Prompt || "").toLowerCase()
    );

    if (similarity > 0.85) return true;
  }
  return false;
};

const checkCopyPaste = (prompt) => {
  const words = prompt.trim().split(" ");
  if (words.length < 6) return true;

  const unique = new Set(words);
  if (unique.size < words.length * 0.5) return true;

  return false;
};

const checkGenericAI = (prompt) => {
  const genericWords = [
    "ultra realistic",
    "8k",
    "cinematic lighting",
    "masterpiece",
    "highly detailed",
    "award winning",
    "best quality"
  ];

  let count = 0;
  genericWords.forEach(word => {
    if (prompt.toLowerCase().includes(word)) count++;
  });

  return count >= 3;
};

/* =======================================================
   ROUND 1 & 3 PROMPT SUBMISSION
======================================================= */

router.post("/submit", async (req, res) => {
  try {

    const { teamId, prompt, round, imageUrl } = req.body;

    if (!teamId || !prompt || !round)
      return res.status(400).json({ error: "Missing data" });

    const roundNumber = Number(round);
    const roundData = await Round.findOne();

    if (!roundData)
      return res.status(400).json({ error: "Round not configured" });

    if (
      (roundNumber === 1 && roundData.round1Locked) ||
      (roundNumber === 2 && roundData.round2Locked) ||
      (roundNumber === 3 && roundData.round3Locked)
    ) {
      return res.status(403).json({ error: `Round ${roundNumber} locked` });
    }

    if (roundData.currentRound !== roundNumber)
      return res.status(403).json({ error: "Round not active" });

    const user = await User.findOne({ teamId });
    if (!user) return res.status(404).json({ error: "Team not found" });

    if (user.eliminated)
      return res.status(403).json({ error: "Team eliminated" });

    let similarityFlag = await checkPromptSimilarity(prompt);
    let copyPasteFlag = checkCopyPaste(prompt);
    let aiGeneratedFlag = checkGenericAI(prompt);

    let fraudScore =
      (similarityFlag ? 40 : 0) +
      (aiGeneratedFlag ? 30 : 0) +
      (copyPasteFlag ? 30 : 0);

    user.similarityFlag = similarityFlag;
    user.aiGeneratedFlag = aiGeneratedFlag;
    user.copyPasteFlag = copyPasteFlag;
    user.fraudScore = fraudScore;

    const score = Math.floor(Math.random() * 50) + 50;

    if (roundNumber === 1) {
      user.round1 = score;
      user.round1Prompt = prompt;
      user.round1ImageUrl = imageUrl;
    }

    if (roundNumber === 3) {
      user.round3 = score;
      user.round3Prompt = prompt;
      user.round3ImageUrl = imageUrl;
    }

    user.total =
      (user.round1 || 0) +
      (user.round2 || 0) +
      (user.round3 || 0);

    await user.save();

    const io = req.app.get("io");
    if (io) io.emit("leaderboardUpdated");

    res.json({ success: true, score });

  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ error: "Submission failed" });
  }
});


/* =======================================================
   ROUND 2 AUDIO SUBMISSION
======================================================= */

router.post("/round2", async (req, res) => {
  try {

    console.log("🔥 ROUND2 API HIT:", req.body);

    const { teamId, fileUrl } = req.body;

    if (!teamId || !fileUrl)
      return res.status(400).json({ success: false, error: "Missing teamId or fileUrl" });

    const roundData = await Round.findOne();
    if (!roundData)
      return res.status(400).json({ error: "Round not configured" });

    if (roundData.round2Locked)
      return res.status(403).json({ error: "Round 2 locked" });

    if (roundData.currentRound !== 2)
      return res.status(403).json({ error: "Round 2 not active" });

    const user = await User.findOne({ teamId });
    if (!user) return res.status(404).json({ error: "Team not found" });

    if (user.eliminated)
      return res.status(403).json({ error: "Team eliminated" });

    const score = Math.floor(Math.random() * 40) + 60;
    const feedback = "🎵 Good track 👍 Improve clarity.";

    user.round2 = score;
    user.round2FileUrl = fileUrl;

    user.total =
      (user.round1 || 0) +
      (user.round2 || 0) +
      (user.round3 || 0);

    await user.save();

    console.log("✅ Round2 Saved:", teamId);

    const io = req.app.get("io");
    if (io) io.emit("leaderboardUpdated");

    res.json({ success: true, score, feedback });

  } catch (err) {
    console.error("Round2 Upload Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


/* =======================================================
   ROUND 3 VIDEO SUBMISSION
======================================================= */

router.post("/round3", async (req, res) => {
  try {

    console.log("🔥 ROUND3 API HIT:", req.body);

    /* 🔥 FIX: Accept both names */
    const { teamId, fileUrl, videoUrl } = req.body;
    const finalUrl = fileUrl || videoUrl;

    if (!teamId || !finalUrl)
      return res.status(400).json({
        success: false,
        error: "Missing teamId or videoUrl"
      });

    const roundData = await Round.findOne();
    if (!roundData)
      return res.status(400).json({ error: "Round not configured" });

    if (roundData.round3Locked)
      return res.status(403).json({ error: "Round 3 locked" });

    if (roundData.currentRound !== 3)
      return res.status(403).json({ error: "Round 3 not active" });

    const user = await User.findOne({ teamId });
    if (!user) return res.status(404).json({ error: "Team not found" });

    if (user.eliminated)
      return res.status(403).json({ error: "Team eliminated" });

    /* 🔥 AUTO SCORE */
    const score = Math.floor(Math.random() * 40) + 60;
    const feedback = "🔥 Creative video! Nice edit.";

    user.round3 = score;
    user.round3VideoUrl = finalUrl;
    user.round3Uploaded = true;

    user.total =
      (user.round1 || 0) +
      (user.round2 || 0) +
      (user.round3 || 0);

    await user.save();

    console.log("✅ Round3 Saved:", teamId);

    const io = req.app.get("io");
    if (io) io.emit("leaderboardUpdated");

    res.json({ success: true, score, feedback });

  } catch (err) {
    console.error("Round3 Upload Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
