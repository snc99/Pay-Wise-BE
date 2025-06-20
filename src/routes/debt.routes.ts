import { Router } from "express";
import {
  createDebt,
  deleteDebt,
  getAllDebts,
} from "../controllers/debt.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getAllDebts);
router.post("/", authenticate, createDebt);
router.delete("/:id", deleteDebt);

export default router;
