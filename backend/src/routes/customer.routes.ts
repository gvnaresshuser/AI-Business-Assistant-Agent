
import { Router } from "express";

import {
  getCustomers,
  getCustomersPaginatedController,
  getCustomer,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
  getCustomerStatsController,
  getCustomerPurchaseHistoryController,
} from "../controllers/customer.controller.js";

const router = Router();

// ============================================
// CUSTOMER LISTING AND STATISTICS
// ============================================

router.get("/", getCustomers);
router.get("/pagination", getCustomersPaginatedController);
router.get("/stats", getCustomerStatsController);

// ============================================
// CUSTOMER CRUD
// ============================================

router.post("/", createCustomerController);
router.get("/:id", getCustomer);
router.put("/:id", updateCustomerController);
router.delete("/:id", deleteCustomerController);

// ============================================
// CUSTOMER PURCHASE HISTORY
// ============================================

router.get("/:id/purchases", getCustomerPurchaseHistoryController);

export default router;
