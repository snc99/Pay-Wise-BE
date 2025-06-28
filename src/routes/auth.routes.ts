import { Router } from "express";
import { login, getProfile, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LoginSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil profil admin yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProfileSuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/me", authenticate, getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout admin dan blacklist token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LogoutSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/logout", authenticate, logout);

export default router;
