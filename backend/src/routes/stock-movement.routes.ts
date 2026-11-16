
import { Router } from "express";

import {
  getStockMovements,
  getStockMovementsByProduct
} from "../controllers/stock-movement.controller.js";

const router = Router();

// GET all stock movements
router.get("/", getStockMovements);

// GET stock movements by product ID
router.get("/product/:productId", getStockMovementsByProduct);

export default router;
