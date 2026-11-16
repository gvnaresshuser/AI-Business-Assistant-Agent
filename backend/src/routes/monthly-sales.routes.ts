
import { Router } from "express";

import {
  getMonthlySales
} from "../controllers/monthly-sales.controller.js";

const router = Router();

// GET monthly sales report
router.get("/", getMonthlySales);

export default router;
