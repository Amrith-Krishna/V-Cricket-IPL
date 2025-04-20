import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { User } from "../schema/user.js";
dotenv.config();

const { SECRET_ACCESS_KEY } = process.env;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.auth;
    if (!token)
      return res
        .status(401)
        .json({ message: "Invalid user or session expired" });
    jwt.verify(token, SECRET_ACCESS_KEY, async (err, user) => {
      if (err) throw new Error(err);
      else {
        console.log(user._id);
        const foundUser = await User.findOne({ _id: user._id });
        if (!foundUser)
          return res
            .status(401)
            .json({ message: "Invalid user or session expired" });
        else {
          req.userId = foundUser._id;
          next();
        }
      }
    });
  } catch (err) {
    res.json({ message: "Error" });
    console.log(err);
  }
};

export default verifyToken;
