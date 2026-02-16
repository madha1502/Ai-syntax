import express from "express";
import User from "../models/User.js";
import Round from "../models/Round.js";

const router = express.Router();

/* ============================= */
/* 🔹 CHANGE CURRENT ROUND ONLY */
/* ============================= */
router.post("/round", async (req, res) => {
  try {
    const { currentRound } = req.body;

    let round = await Round.findOne();
    if (!round) round = await Round.create({});

    round.currentRound = currentRound;
    await round.save();

    res.json({ message: "Round Updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================= */
/* 🔓 UNLOCK ROUND + START TIMER */
/* ============================= */
router.post("/unlock-round", async (req, res) => {
 // console.log("🔥 UNLOCK ROUND API HIT:", req.body);
  try {
    const { roundNumber, durationMinutes } = req.body;

    let round = await Round.findOne();
    if (!round) round = await Round.create({});

    // Set current round
    round.currentRound = roundNumber;

    // Lock all rounds first
    round.round1Locked = true;
    round.round2Locked = true;
    round.round3Locked = true;

    // Unlock selected round
    if (roundNumber === 1) round.round1Locked = false;
    if (roundNumber === 2) round.round2Locked = false;
    if (roundNumber === 3) round.round3Locked = false;

    // Start timer
    round.roundStartTime = new Date();
    round.roundEndTime = new Date(
      Date.now() + (durationMinutes || 15) * 60 * 1000
    );

    await round.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================= */
/* 🔒 MANUAL LOCK ROUND */
/* ============================= */
router.post("/lock-round", async (req, res) => {
  try {
    const { roundNumber } = req.body;

    let round = await Round.findOne();
    if (!round) round = await Round.create({});

    if (roundNumber === 1) round.round1Locked = true;
    if (roundNumber === 2) round.round2Locked = true;
    if (roundNumber === 3) round.round3Locked = true;

    await round.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================= */
/* 🔥 AUTO ELIMINATE BOTTOM 30% */
/* ============================= */
router.post("/auto-eliminate", async (req, res) => {
  try {
    const users = await User.find({ eliminated: false }).sort({ total: 1 });

    const countToEliminate = Math.ceil(users.length * 0.3);
    const toEliminate = users.slice(0, countToEliminate);

    const ids = toEliminate.map(u => u._id);

    await User.updateMany(
      { _id: { $in: ids } },
      { $set: { eliminated: true } }
    );

    res.json({ message: "Bottom 30% eliminated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================= */
/* 🔄 FULL RESET SYSTEM */
/* ============================= */
router.post("/full-reset", async (req, res) => {
  try {

    await User.updateMany({}, {
      $set: {
        total: 0,
        eliminated: false,
        round1: 0,
        round2: 0,
        round3: 0,
        round1Prompt: null,
        round1ImageUrl: null,
        round2FileUrl: null,
        round3Prompt: null,
        round3ImageUrl: null
      }
    });

    let round = await Round.findOne();
    if (!round) round = await Round.create({});

    round.currentRound = 1;
    round.round1Locked = true;
    round.round2Locked = true;
    round.round3Locked = true;
    round.roundStartTime = null;
    round.roundEndTime = null;

    await round.save();

    res.json({ message: "Competition Reset Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================= */
/* 🔥 LIVE SSE DASHBOARD */
/* ============================= */
router.get("/live", async (req, res) => {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendData = async () => {

    const users = await User.find().sort({ total: -1 });

    const totalUsers = users.length;
    const eliminatedUsers = users.filter(u => u.eliminated).length;
    const activeUsers = totalUsers - eliminatedUsers;

    let round = await Round.findOne();
    if (!round) round = await Round.create({});

    /* ===== AUTO LOCK IF TIMER ENDED ===== */

    if (
      round.roundEndTime &&
      new Date() > new Date(round.roundEndTime)
    ) {
      round.round1Locked = true;
      round.round2Locked = true;
      round.round3Locked = true;
      await round.save();
    }

    const payload = {
      users,
      stats: {
        totalUsers,
        activeUsers,
        eliminatedUsers,
        currentRound: round.currentRound,
        round1Locked: round.round1Locked,
        round2Locked: round.round2Locked,
        round3Locked: round.round3Locked,
        roundEndTime: round.roundEndTime
      }
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendData();
  const interval = setInterval(sendData, 2000);

  req.on("close", () => clearInterval(interval));
});
/* ================= FRAUD REPORT ================= */
router.get("/fraud-report", async (req, res) => {

  const users = await User.find()
    .sort({ fraudScore: -1 })
    .select("teamId name fraudScore similarityFlag aiGeneratedFlag copyPasteFlag");

  res.json(users);
});

export default router;
