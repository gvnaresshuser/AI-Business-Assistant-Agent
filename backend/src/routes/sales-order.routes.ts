
import { Router } from "express";

import {
  getSalesOrders,
  getSalesOrder
} from "../controllers/sales-order.controller.js";

const router = Router();

router.get("/", getSalesOrders);
router.get("/:id", getSalesOrder);

export default router;
