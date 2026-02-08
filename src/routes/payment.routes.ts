import express from "express";
import {
  createPayment,
  deleteCycle,
  getPayments,
} from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/payment:
 *   get:
 *     summary: Mendapatkan semua data payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaymentListSuccessResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", authenticate, getPayments);

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Membuat data payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateInput'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/PaymentCreateResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", authenticate, createPayment);

/**
 * @swagger
 * /api/payment/{cycleId}:
 *   delete:
 *     summary: Menghapus data payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cycleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaymentDeleteResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:cycleId", authenticate, deleteCycle);

export default router;
