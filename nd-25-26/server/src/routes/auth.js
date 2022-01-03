import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import joi from "joi";
dotenv.config();

const router = Router();

const userInfoSchema = joi.object({
  username: joi.string().max(50),
  password: joi.string().min(8),
  email: joi.string().max(50)
});

router.post("/register", async (req, res) => {
  const {mysql} = req.app;

  try {
    const {username, password, email} = await userInfoSchema.validateAsync(req.body);
    const hashed = await bcrypt.hash(password, 10);
    const query = "INSERT INTO nd2526_Users (username, password, email) VALUES (?, ?, ?);";

    await mysql.query(query, [username, hashed, email]);

    res.send({
      registered: username,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  const {mysql} = req.app;

  try {
    const query = "SELECT * FROM nd2526_Users WHERE username = ?";
    const [result] = await mysql.query(query, [username]);
    const [user] = result;

    if (!user) {
      return res.status(404).send({
        error: "No such username",
      });
    }

    const validPw = await bcrypt.compare(password, user.password);

    if (!validPw) {
      return res.status(403).send({
        error: "Bad password",
      });
    }

    const token = jwt.sign({user_id: user.id}, process.env.TOKEN_SECRET);

    res.send({
      token,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

export default router;
