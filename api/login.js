import { User } from "../schema/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import * as dotenv from "dotenv";

dotenv.config()
const {SECRET_ACCESS_KEY} = process.env

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Update login count and last login time
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = new Date();
      await user.save();
      const cookie = jwt.sign({ _id: user._id }, SECRET_ACCESS_KEY, { expiresIn: "1h" })
      console.log(cookie)
      res
        .cookie("auth", cookie, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: "lax",
          secure: true,
        })
        .json({ success: true, username: user.username });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export default login;
