
import { Router } from "express";

import {
  getExpenses,
  getExpense
} from "../controllers/expense.controller.js";

const router = Router();

// GET all expenses
router.get("/", getExpenses);

// GET expense by ID
router.get("/:id", getExpense);

export default router;
