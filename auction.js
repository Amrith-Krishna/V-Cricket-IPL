import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import cron from "node-cron";

import login from "./api/login.js";
import getUserPredictions from "./api/getUserPredictions.js";
import updatePointsForAllUsers from "./api/updatePointsForAllUsers.js";
import getMatches from "./api/getMatches.js";
import predict from "./api/predict.js";
import getLeaderboard from "./api/getLeaderboard.js";
import getTodayPredictions from "./api/getTodayPredictions.js";
import verifyToken from "./api/verifyToken.js";

dotenv.config();
const { URI } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
  //origin: "https://v-cricket-ipl-prediction.onrender.com/"
  // //IMPORTANT MAKE SURE THIS IS CORRECT
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", express.static(__dirname + "/public"));

app.get("/public/*", (req, res) => {
  console.log("src req");
  res.status(404).json({ invalid: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get("/login", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get("/schedule", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/schedule.html"));
});

app.get("/board", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/board.html"));
});

app.get("/today", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/today.html"));
});

app.post("/login", login);

app.get("/user-predictions", verifyToken, getUserPredictions);

app.get("/matches", verifyToken, getMatches);

app.post("/predict", verifyToken, predict);

app.get("/leaderboard",verifyToken, getLeaderboard);

app.get("/today-predictions/:matchId", verifyToken, getTodayPredictions);

app.get("*", (req, res) => {
  console.log("404");
  res.status(404).json({ message: "Invalid page" });
});

cron.schedule("0 0 * * *", () => {
  console.log("Running daily points update...");
  updatePointsForAllUsers();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
