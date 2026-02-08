import { Router } from "express";
import {
  createDebt,
  getAllDebts,
  getDebtItems,
  getOpenDebtCycles,
  getPublicDebts,
} from "../controllers/debt.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/debt:
 *   get:
 *     summary: Ambil semua data utang
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword pencarian (nama, email, username, dll)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DebtListSuccessResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", authenticate, getAllDebts);

/**
 * @swagger
 * /api/debt:
 *   post:
 *     summary: Tambah utang untuk user
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DebtCreateInput'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/DebtCreateResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", authenticate, createDebt);

/**
 * @swagger
 * /api/debt/:cycleId/items:
 *   get:
 *     summary: Ambil semua item dalam satu invoice (debt cycle)
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DebtItemsSuccessResponse(belom di buat swagernya)'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:cycleId/items", authenticate, getDebtItems);

/**
 * @swagger
 * /api/debt/open:
 *   get:
 *     summary: Ambil semua invoice yang belum lunas
 *     tags: [Dropdown Select]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserDropdownAmountResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/open", authenticate, getOpenDebtCycles);

/**
 * @swagger
 * /api/debt/public:
 *   get:
 *     summary: Ambil semua data utang publik (tanpa autentikasi)
 *     tags: [Debt]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword pencarian (nama, email, username, dll)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PublicDebtListSuccessResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/public", getPublicDebts);

export default router;
