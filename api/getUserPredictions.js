import { Prediction } from "../schema/prediction.js";

const getUserPredictions = async (req, res) => {
  const userId = req.userId;
  if (!userId) res.status(500);
  try {
    const predictions = await Prediction.find({ userId });
    res.json(predictions);
  } catch (error) {
    console.error("User predictions error:", error);
    res.status(500).json({ message: "Failed to fetch user predictions" });
  }
};

export default getUserPredictions;
