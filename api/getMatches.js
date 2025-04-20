import { Match } from "../schema/match.js";

const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({}).sort({ finished: 1, date: 1 });
    res.json(matches);
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ message: "Failed to get matches" });
  }
};

export default getMatches;
