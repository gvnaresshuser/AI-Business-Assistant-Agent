
import { Router } from "express";
import {
  getBusinesses,
  getBusiness
} from "../controllers/business.controller.js";

const router = Router();

router.get("/", getBusinesses);
router.get("/:id", getBusiness);

export default router;
