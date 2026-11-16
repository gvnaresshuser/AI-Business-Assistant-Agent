
import { Router } from "express";

import {
  getExpenseSummary
} from "../controllers/expense-summary.controller.js";

const router = Router();

// GET expense summary report
router.get("/", getExpenseSummary);

export default router;
