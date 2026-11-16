
import { Router } from "express";

import {
  getRefundSummary
} from "../controllers/refund-summary.controller.js";

const router = Router();

// GET refund summary report
router.get("/", getRefundSummary);

export default router;
