import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  searchUsers,
  updateUser,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// Semua admin/super admin bisa akses
router.get("/", authenticate, getAllUsers);
router.post("/", authenticate, createUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);
router.get("/search", authenticate, searchUsers);


export default router;
