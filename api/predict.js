import { Match } from "../schema/match.js";
import { Prediction } from "../schema/prediction.js";

const predict = async (req, res) => {
  const { matchId, team } = req.body;
  const userId = req.userId
  try {
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (new Date() > new Date(match.date)) {
      return res.status(400).json({
        message: "Match has already started. Predictions are closed.",
      });
    }

    const existingPrediction = await Prediction.findOne({ userId, matchId });
    if (existingPrediction) {
      return res
        .status(400)
        .json({ message: "Prediction already exists and cannot be changed" });
    }

    if (team != match.team1 && team != match.team2) {
      return res.status(400).json({ message: "Invalid team prediction" });
    }

    const newPrediction = new Prediction({
      userId,
      matchId,
      predictedTeam: team,
    });
    await newPrediction.save();
    res.json({ message: "Prediction saved" });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Failed to save prediction" });
  }
};

export default predict;
