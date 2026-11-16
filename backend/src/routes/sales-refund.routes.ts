
import { Router } from "express";

import {
  getSalesRefunds,
  getSalesRefund
} from "../controllers/sales-refund.controller.js";

const router = Router();

// GET all sales refunds
router.get("/", getSalesRefunds);

// GET sales refund by ID
router.get("/:id", getSalesRefund);

export default router;
