
import { Router } from "express";

import {
  getCategorySales
} from "../controllers/category-sales.controller.js";

const router = Router();

// GET sales by product category
router.get("/", getCategorySales);

export default router;
