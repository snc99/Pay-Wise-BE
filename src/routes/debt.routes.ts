import { Router } from "express";
import {
  createDebt,
  deleteDebt,
  getAllDebts,
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
 * /api/debt/{id}:
 *   delete:
 *     summary: Hapus data utang
 *     tags: [Debt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DebtDeleteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:id", deleteDebt);

export default router;
