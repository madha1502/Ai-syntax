import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ teamId: email });

    if (!user) {
      return res.status(401).json({ message: "Invalid Team ID or Password" });
    }

    if (user.pin !== password) {
      return res.status(401).json({ message: "Invalid Team ID or Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token, team: user.teamId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ teamId: email });
//     if (!user) return res.status(404).json({ message: "Team not found" });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ message: "Wrong password" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

//     res.json({ token, team: user.teamId });

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return res.status(401).json({ message: "Wrong password" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     res.json({ token });

//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

export default router;   // 🔥 THIS LINE MUST EXIST
