
import { Router } from "express";

import {
  getOutOfStockProducts
} from "../controllers/out-of-stock.controller.js";

const router = Router();

// GET out of stock products
router.get("/", getOutOfStockProducts);

export default router;
