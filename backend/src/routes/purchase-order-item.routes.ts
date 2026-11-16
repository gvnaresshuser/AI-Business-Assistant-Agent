
import { Router } from "express";

import {
  getPurchaseOrderItems,
  getPurchaseOrderItemsByOrder
} from "../controllers/purchase-order-item.controller.js";

const router = Router();

// GET all purchase order items
router.get("/", getPurchaseOrderItems);

// GET items by purchase order ID
router.get("/order/:orderId", getPurchaseOrderItemsByOrder);

export default router;
