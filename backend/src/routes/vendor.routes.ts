
import { Router } from "express";

import {
  getVendors,
  getVendor
} from "../controllers/vendor.controller.js";

const router = Router();

// GET all vendors
router.get("/", getVendors);

// GET vendor by ID
router.get("/:id", getVendor);

export default router;
