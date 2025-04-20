import mongoose from "mongoose";
const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  predictedTeam: String,
  hasChanged: { type: Boolean, default: false },
  pointsAwarded: { type: Boolean, default: false }, // Add this field
});

export const Prediction = mongoose.model("Prediction", predictionSchema);
