import express from "express";
import { createPayment, deletePayment, getDeletedPayments, getPayments } from "../controllers/payment.controller";

const router = express.Router();

router.get("/", getPayments);
router.post("/", createPayment);
router.delete("/:id", deletePayment);
router.get("/history", getDeletedPayments);


export default router;
