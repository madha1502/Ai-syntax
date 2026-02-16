import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    for (let i = 1; i <= 200; i++) {

      const teamNumber = i.toString().padStart(2, "0");
      const teamId = `TEAM${teamNumber}`;
      const rawPin = `PASS${teamNumber}`;

      const existing = await User.findOne({ teamId });
      if (existing) {
        console.log(`${teamId} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(rawPin, 10);

      await User.create({
        teamId,
        name: teamId,
        pin: rawPin,
        password: hashedPassword
      });

      console.log(`Created ${teamId}`);
    }

    console.log("Seeding Complete ✅");
    process.exit();
  })
  .catch(err => console.log(err));
