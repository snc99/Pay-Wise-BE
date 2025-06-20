// Di route umum, misalnya routes/index.ts
import express from "express";
const router = express.Router();

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

export default router;
