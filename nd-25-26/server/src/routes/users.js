import { Router } from "express";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.get("/", async (req, res) => {
  const { mysql } = req.app;

  try {
    const query = "SELECT COUNT(*) as total_count FROM nd2526_Users;";

    const [result] = await mysql.query(query);
    const [total_count] = result;

    res.send(total_count);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

export default router;
