
import { Router } from "express";

import {
  getLowStockProducts
} from "../controllers/low-stock.controller.js";

const router = Router();

// GET low stock products
router.get("/", getLowStockProducts);

export default router;
