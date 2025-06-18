import { Router } from "express";
import { createAdmin, getAllAdmins } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

router.get("/", authenticate, getAllAdmins);
router.post("/", authenticate, authorizeRole(["SUPERADMIN"]), createAdmin);

export default router;
