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

router.get("/", authenticate, getAllAdmins);
router.post("/", authenticate, authorizeRole(["SUPERADMIN"]), createAdmin);
router.put("/:id", authenticate, authorizeRole(["SUPERADMIN"]), updateAdmin);
router.delete("/:id", authenticate, authorizeRole(["SUPERADMIN"]), deleteAdmin);

export default router;
