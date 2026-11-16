
import { Router } from "express";

import {
  getStockMovementSummary
} from "../controllers/stock-movement-summary.controller.js";

const router = Router();

// GET stock movement summary
router.get("/", getStockMovementSummary);

export default router;
