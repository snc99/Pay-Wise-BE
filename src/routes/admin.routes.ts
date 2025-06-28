import { Router } from "express";
import {
  createAdmin,
  deleteAdmin,
  getAllAdmins,
  updateAdmin,
} from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Mendapatkan semua admin (dengan pencarian dan pagination)
 *     tags: [Admin]
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
 *         $ref: '#/components/responses/AdminListSuccessResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", authenticate, authorizeRole(["SUPERADMIN"]), getAllAdmins);

/**
 * @swagger
 * /api/admin:
 *   post:
 *     summary: Membuat admin baru
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateInput'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/AdminCreateSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", authenticate, authorizeRole(["SUPERADMIN"]), createAdmin);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Memperbarui admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateInput'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AdminUpdateSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/:id", authenticate, authorizeRole(["SUPERADMIN"]), updateAdmin);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Menghapus admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AdminDeleteSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:id", authenticate, authorizeRole(["SUPERADMIN"]), deleteAdmin);

export default router;
