
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

// Customer listing and statistics
router.get("/", getCustomers);
router.get("/pagination", getCustomersPaginatedController);
router.get("/stats", getCustomerStatsController);

// Customer CRUD
router.post("/", createCustomerController);
router.get("/:id", getCustomer);
router.put("/:id", updateCustomerController);
router.delete("/:id", deleteCustomerController);

// Customer purchase history
router.get("/:id/purchases", getCustomerPurchaseHistoryController);

export default router;
