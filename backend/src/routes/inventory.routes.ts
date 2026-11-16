
import { Router } from "express";

import {
  getInventory,
  getInventoryByProduct
} from "../controllers/inventory.controller.js";

const router = Router();

// GET all inventory records
router.get("/", getInventory);

// GET inventory by product ID
router.get("/product/:productId", getInventoryByProduct);

export default router;
