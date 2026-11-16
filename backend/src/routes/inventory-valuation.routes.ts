
import { Router } from "express";

import {
  getInventoryValuation
} from "../controllers/inventory-valuation.controller.js";

const router = Router();

// GET inventory valuation report
router.get("/", getInventoryValuation);

export default router;
