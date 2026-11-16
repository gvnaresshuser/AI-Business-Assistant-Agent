
import { Router } from "express";

import {
  getSalesSummary,
  getCustomerCount,
  getProductCount,
} from "../controllers/analytics.controller.js";

const router = Router();

// GET overall sales summary
router.get("/sales-summary", getSalesSummary);
// GET total customer count
router.get("/customer-count", getCustomerCount);

// GET total product count
router.get("/product-count", getProductCount);

export default router;
