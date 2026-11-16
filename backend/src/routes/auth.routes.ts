import { Router } from "express";

import {
  login,
  logout,
  getCurrentUser,
  changePassword
} from "../controllers/auth.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Public login
router.post("/login", login);

// Protected current-user endpoint
router.get("/me", authenticateToken, getCurrentUser);

// Protected logout
router.post("/logout", authenticateToken, logout);

// Protected password-change endpoint
router.post("/change-password", authenticateToken, changePassword);

export default router;