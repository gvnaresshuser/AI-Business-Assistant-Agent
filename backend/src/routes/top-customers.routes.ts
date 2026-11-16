
import { Router } from "express";

import {
  getTopCustomers
} from "../controllers/top-customers.controller.js";

const router = Router();

// GET top 5 customers by sales revenue
router.get("/", getTopCustomers);

export default router;
