
import { Router } from "express";

import {
  getPurchaseOrders,
  getPurchaseOrder
} from "../controllers/purchase-order.controller.js";

const router = Router();

// GET all purchase orders
router.get("/", getPurchaseOrders);

// GET purchase order by ID
router.get("/:id", getPurchaseOrder);

export default router;
