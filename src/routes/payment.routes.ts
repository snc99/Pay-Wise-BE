import express from "express";
import {
  createPayment,
  deletePayment,
  getDeletedPayments,
  getPayments,
} from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticate, getPayments);
router.post("/", authenticate, createPayment);
router.delete("/:id", authenticate, deletePayment);
router.get("/history", authenticate, getDeletedPayments);

export default router;
