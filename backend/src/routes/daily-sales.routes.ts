
import { Router } from "express";

import {
  getDailySales
} from "../controllers/daily-sales.controller.js";

const router = Router();

// GET daily sales report
router.get("/", getDailySales);

export default router;
