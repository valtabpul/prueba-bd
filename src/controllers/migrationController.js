import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { migrar } from '../services/migrationService.js';

/**
 * Controlador para manejar la migración de datos desde CSV
 */
export const migrateFromCSV = async (req, res) => {
  try {
    // Ruta al archivo CSV
    const csvPath = path.join(process.cwd(), 'data', 'AM-prueba-desempeno-data_m4.csv');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        error: 'Archivo CSV no encontrado',
        path: csvPath
      });
    }

    console.log(`\nAnalizando archivo CSV: ${csvPath}`);
    
    // Leer y parsear el archivo CSV
    const records = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => records.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`CSV correctamente: ${records.length}`);

    // Ejecutar la migración
    const result = await migrar(records);

    res.json({
      success: true,
      message: 'Migración completada',
      runId: result.runId,
      statistics: result.stats
    });

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Controlador para obtener el estado de una migración por runId
 */
export const getMigrationStatus = async (req, res) => {
  try {
    const { runId } = req.params;
    
    // Importar AuditLog
    const { AuditLog } = await import('../models/auditLog.js');
    
    // Buscar todos los logs de esta migración
    const logs = await AuditLog.find({ runId }).sort({ createdAt: 1 });
    
    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ninguna migración con ese runId'
      });
    }

    // Calcular estadísticas
    const stats = {
      total: logs.length,
      successful: logs.filter(log => log.status === 'SUCCESS').length,
      errors: logs.filter(log => log.status === 'ERROR').length,
      byTable: {}
    };

    // Agrupar por tabla
    logs.forEach(log => {
      if (!stats.byTable[log.table]) {
        stats.byTable[log.table] = { success: 0, error: 0 };
      }
      if (log.status === 'SUCCESS') {
        stats.byTable[log.table].success++;
      } else {
        stats.byTable[log.table].error++;
      }
    });

    res.json({
      success: true,
      runId,
      statistics: stats,
      logs: logs.slice(0, 50) // Limitar a 50 logs para no saturar la respuesta
    });

  } catch (error) {
    console.error('❌ Error al obtener estado de migración:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getMigrationHelp = async (req, res) => {
  try {
    const { AuditLog } = await import('../models/auditLog.js');

    const latestLog = await AuditLog.findOne({}).sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: 'Usa GET /api/prueba/migration/:runId para consultar una migración específica',
      latestRunId: latestLog?.runId || null,
      example: latestLog?.runId
        ? `/api/prueba/migration/${latestLog.runId}`
        : null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
