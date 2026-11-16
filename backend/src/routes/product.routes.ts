
import { Router } from "express";
import {
  getProducts,
  getProduct,
  getProductsPaginated,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/pagination", getProductsPaginated);
router.post("/", createProductController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);
router.get("/:id", getProduct);

export default router;
