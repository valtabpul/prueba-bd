import { Router } from "express";
import { initDb } from "../controllers/initController";
const router = Router();

router.post("/init-db", initDb);

export default router;