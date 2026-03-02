import { Router } from "express";
import {
  suppliersAnalysis,
  customerPurchaseHistory,
  topProductsByCategory,
} from "../controllers/biController.js";

const router = Router();

router.get("/suppliers/analysis", suppliersAnalysis);
router.get("/customers/:customerId/history", customerPurchaseHistory);
router.get("/categories/:categoryId/top-products", topProductsByCategory);

export default router;