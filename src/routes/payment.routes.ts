import express from "express";
import { createPayment, getPayments } from "../controllers/payment.controller";

const router = express.Router();

router.post("/", createPayment);
router.get("/", getPayments);


export default router;
