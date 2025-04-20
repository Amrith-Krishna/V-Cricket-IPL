import { User } from "../schema/user.js";
import { Match } from "../schema/match.js";
import { Prediction } from "../schema/prediction.js";


const getTodayPredictions = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error("User not found");
    const match = await Match.findOne({ _id: matchId });
    if (!match) throw new Error("Match not found");
    const today = new Date();
    if (
      match.date.getDate() !== today.getDate() ||
      match.date.getMonth() !== today.getMonth() ||
      match.date.getFullYear() !== today.getFullYear()
    )
      throw new Error("Not Todays Match");
    const userPrediction = await Prediction.findOne({ userId, matchId });
    if (!userPrediction) throw new Error("User has not predicted today");

    await Promise.all(
      (
        await Prediction.find({ matchId })
      ).map(async (pred) => ({
        team1: match.team1,
        team2: match.team2,
        predictedTeam: pred.predictedTeam,
        username: (await User.findOne({ _id: pred.userId })).username,
      }))
    ).then((result) => res.json(result));
  } catch (err) {
    if (err.message === "User has not predicted today") {
      return res.status(400).json({ message: "User has not predicted today" });
    }
    res.status(500).json({ message: "Failed to get predictions" });
    console.log(err.message);
  }
};

export default getTodayPredictions;
