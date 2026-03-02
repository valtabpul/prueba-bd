import express from 'express';
import { migrateFromCSV, getMigrationStatus, getMigrationHelp } from '../controllers/migrationController.js';

const router = express.Router();

/**
 * POST /api/prueba/migrate
 * Ejecutar la migración de datos desde el archivo CSV
 */
router.post('/migrate', migrateFromCSV);

router.get('/migration', getMigrationHelp);

/**
 * GET /api/prueba/migration/:runId
 * Obtener el estado y estadísticas de una migración específica
 */
router.get('/migration/:runId', getMigrationStatus);

export default router;
