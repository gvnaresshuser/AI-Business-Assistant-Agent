
import { Router } from "express";

import {
  getTopSellingProducts
} from "../controllers/top-products.controller.js";

const router = Router();

// GET top 5 selling products
router.get("/", getTopSellingProducts);

export default router;
