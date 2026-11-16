
import { Router } from "express";

import {
  getPaymentMethodSummary
} from "../controllers/payment-method.controller.js";

const router = Router();

// GET payment summary grouped by payment method
router.get("/", getPaymentMethodSummary);

export default router;
