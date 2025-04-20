import { User } from "../schema/user.js";

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).sort({ points: -1, accuracy: -1 });
    res.json(
      users.map((user) => ({
        username: user.username,
        points: user.points,
        accuracy: user.accuracy,
      }))
    );
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to get leaderboard" });
  }
};

export default getLeaderboard;
