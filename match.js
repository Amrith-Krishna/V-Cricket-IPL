import mongoose from "mongoose";
const matchSchema = new mongoose.Schema({
  team1: String,
  team2: String,
  date: Date,
  venue: String,
  winner: String,
  finished: Boolean,
});

export const Match = mongoose.model("Match", matchSchema);
