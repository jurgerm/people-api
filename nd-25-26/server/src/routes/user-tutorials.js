import { Router } from "express";
import { loggedInMiddleware } from "../middleware/loggedIn.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.get("/:id", loggedInMiddleware, async (req, res) => {
  const { mysql } = req.app;
  const { id } = req.params;
  

  try {
    const query = "SELECT * FROM nd2526_Tutorials WHERE user_id = ?;";
    const [tutorials] = await mysql.query(query, [id]);

    res.send(tutorials);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

export default router;
