import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  /* ================= BASIC INFO ================= */
  name: { type: String, required: true },
  teamId: { type: String, required: true, unique: true },
  pin: { type: String, required: true },

  /* ================= ROUND SCORES ================= */
  round1: { type: Number, default: 0 },
  round2: { type: Number, default: 0 },
  round3: { type: Number, default: 0 },

  total: { type: Number, default: 0 },

  /* ================= ROUND 1 AI SUBMISSION ================= */
  round1Prompt: { type: String, default: "" },
  round1ImageUrl: { type: String, default: "" },

  /* ================= ROUND 2 MUSIC ================= */
  round2FileUrl: { type: String, default: "" },
  round2Uploaded: { type: Boolean, default: false },

  /* ================= ROUND 3 AI SUBMISSION ================= */
  round3Prompt: { type: String, default: "" },
  round3ImageUrl: { type: String, default: "" },

  /* 🔥 ROUND 3 VIDEO UPLOAD */
  round3VideoUrl: { type: String, default: "" },
  round3Uploaded: { type: Boolean, default: false },

  /* ================= STATUS ================= */
  eliminated: { type: Boolean, default: false },

  /* ================= AI FRAUD FLAGS ================= */
  similarityFlag: { type: Boolean, default: false },
  aiGeneratedFlag: { type: Boolean, default: false },
  copyPasteFlag: { type: Boolean, default: false },
  fraudScore: { type: Number, default: 0 },

  /* 🔥 EXTRA DEBUG INFO */
  lastUploadTime: { type: Date },
  lastRoundPlayed: { type: Number }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
