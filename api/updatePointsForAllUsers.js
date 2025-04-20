import { Match } from "../schema/match.js";
import { User } from "../schema/user.js";
import { Prediction } from "../schema/prediction.js";

async function updatePointsForAllUsers() {
  try {
    const matches = await Match.find({ winner: { $ne: null } }); // Get matches with winners
    console.log("Matches with winners:", matches);

    for (const match of matches) {
      console.log(
        `Checking match: ${match.homeTeam} vs ${match.awayTeam}, Winner: ${match.winner}`
      );
      await Match.updateOne({ _id: match._id }, { finished: true });
      const predictions = await Prediction.find({ matchId: match._id }); // Get all predictions for the match
      console.log(`Predictions for match ${match._id}:`, predictions);

      for (const prediction of predictions) {
        console.log(
          `Checking prediction for user ${prediction.userId}: Predicted ${prediction.predictedTeam}`
        );
        if (
          prediction.predictedTeam === match.winner &&
          !prediction.pointsAwarded
        ) {
          await User.updateOne(
            { _id: prediction.userId },
            { $inc: { points: 1 } }
          );
          await Prediction.updateOne(
            { _id: prediction._id },
            { pointsAwarded: true }
          );
          console.log(
            `Points updated for user ${prediction.userId} for match ${match._id}`
          );
        } else {
          console.log(
            `No points awarded for user ${prediction.userId} for match ${match._id}`
          );
        }
      }
    }
    const users = await User.find({});
    for (const user of users) {
      console.log(`checking user ${user.username}`);
      const predictions = await Prediction.find({ userId: user._id });
      let total = 0;
      let correct = 0;
      for (const pred of predictions) {
        const match = await Match.findOne({ _id: pred.matchId });
        total++;
        if (pred.pointsAwarded && pred.predictedTeam === match.winner)
          correct++;
      }
      let acc = 0.0;
      if (total != 0) acc = (correct / total) * 100;
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { accuracy: acc } }
      );
    }
  } catch (error) {
    console.error("Points update error:", error);
  }
}

export default updatePointsForAllUsers;
