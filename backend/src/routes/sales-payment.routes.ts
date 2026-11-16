
import { Router } from "express";

import {
  getSalesPayments,
  getSalesPayment
} from "../controllers/sales-payment.controller.js";

const router = Router();

// GET all sales payments
router.get("/", getSalesPayments);

// GET sales payment by ID
router.get("/:id", getSalesPayment);

export default router;
