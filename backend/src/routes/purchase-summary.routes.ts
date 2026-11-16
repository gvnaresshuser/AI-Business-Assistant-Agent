
import { Router } from "express";

import {
  getPurchaseSummary
} from "../controllers/purchase-summary.controller.js";

const router = Router();

// GET purchase summary report
router.get("/", getPurchaseSummary);

export default router;
