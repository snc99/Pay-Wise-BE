import { Router } from "express";
import {
  getCards, // GET /api/dashboard/cards
  getComparison, // GET /api/dashboard/compare
  getDailyPaymentTrends, // GET /api/dashboard/trends/daily-payments
} from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * /api/dashboard/cards:
 *   get:
 *     summary: Mendapatkan data ringkas untuk dashboard (cards)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalPayments:
 *                   type: number
 *                 totalDebts:
 *                   type: number
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/cards", authenticate, getCards);

/**
 * @swagger
 * /api/dashboard/compare:
 *   get:
 *     summary: Perbandingan total utang vs total pembayaran
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/compare", authenticate, getComparison);

/**
 * @swagger
 * /api/dashboard/trends/daily-payments:
 *   get:
 *     summary: Tren pembayaran harian (labels/data siap dipakai chart)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: jumlah hari terakhir
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/trends/daily-payments", authenticate, getDailyPaymentTrends);

export default router;
