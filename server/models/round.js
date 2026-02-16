import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({

  /* ================= CURRENT ROUND ================= */
  currentRound: { type: Number, default: 1 },

  /* ================= LOCK STATUS ================= */
  round1Locked: { type: Boolean, default: true },
  round2Locked: { type: Boolean, default: true },
  round3Locked: { type: Boolean, default: true },

  /* ================= TIMER SUPPORT ================= */
  roundStartTime: { type: Date },
  roundEndTime: { type: Date }

}, { timestamps: true });

export default mongoose.model("Round", roundSchema);
