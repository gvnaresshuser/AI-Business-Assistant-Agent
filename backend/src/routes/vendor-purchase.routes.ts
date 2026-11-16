
import { Router } from "express";

import {
  getVendorPurchaseSummary
} from "../controllers/vendor-purchase.controller.js";

const router = Router();

// GET vendor-wise purchase report
router.get("/", getVendorPurchaseSummary);

export default router;
