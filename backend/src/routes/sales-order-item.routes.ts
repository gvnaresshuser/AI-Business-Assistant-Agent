import { Router } from "express";

import {
  getSalesOrderItems,
  getSalesOrderItemsByOrder
} from "../controllers/sales-order-item.controller.js";

const router = Router();

router.get("/", getSalesOrderItems);
router.get("/order/:orderId", getSalesOrderItemsByOrder);

export default router;