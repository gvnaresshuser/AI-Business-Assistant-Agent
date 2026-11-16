import { Router } from "express";
import { checkDatabase } from "../controllers/database.controller.js";

const router = Router();

router.get("/health", checkDatabase);

export default router;