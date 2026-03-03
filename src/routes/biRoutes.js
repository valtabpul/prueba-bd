import { Router } from "express";
import {
  suppliersAnalysis,
  customerPurchaseHistory,
  topProductsByCategory,
} from "../controllers/biController.js";

const router = Router();

// prueba para confirmar que BI funciona
router.get("/ping", (req, res) => res.json({ ok: true, bi: true }));

router.get("/suppliers/analysis", suppliersAnalysis);
router.get("/customers/:customerId/history", customerPurchaseHistory);
router.get("/categories/:categoryId/top-products", topProductsByCategory);

export default router;