import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { migrar } from "../services/migrationService.js";
import { AuditLog } from "../models/auditLog.js";
import { getPostgresCounts } from "../services/reportService.js";

export const migrateFromCSV = async (req, res) => {
  try {
    const csvPath = path.join(process.cwd(), "data", "AM-prueba-desempeno-data_m4.csv");

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        error: "Archivo CSV no encontrado",
        path: csvPath,
      });
    }

    const records = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => records.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const result = await migrar(records);

    const pgCounts = await getPostgresCounts();
    const mongoCounts = {
    auditLogsForRun: await AuditLog.countDocuments({ runId: result.runId }),
    auditLogsTotal: await AuditLog.countDocuments({}),
    };

    res.json({
    success: true,
    message: "Migración completada",
    runId: result.runId,
    statistics: result.stats,
    verify: {
        postgresCounts: pgCounts,
        mongoCounts,
    },
    });

    res.json({
      success: true,
      message: "Migración completada",
      runId: result.runId,
      statistics: result.stats,
    });
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getMigrationStatus = async (req, res) => {
  try {
    const { runId } = req.params;

    const logs = await AuditLog.find({ runId }).sort({ createdAt: 1 });

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No se encontró ninguna migración con ese runId",
      });
    }

    const stats = {
      total: logs.length,
      successful: logs.filter((log) => log.status === "SUCCESS").length,
      errors: logs.filter((log) => log.status === "ERROR").length,
      byTable: {},
    };

    logs.forEach((log) => {
      if (!stats.byTable[log.table]) stats.byTable[log.table] = { success: 0, error: 0 };
      if (log.status === "SUCCESS") stats.byTable[log.table].success++;
      else stats.byTable[log.table].error++;
    });

    res.json({
      success: true,
      runId,
      statistics: stats,
      logs: logs.slice(0, 200), // puedes subir o bajar este límite
    });
  } catch (error) {
    console.error("❌ Error al obtener estado de migración:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getMigrationHelp = async (req, res) => {
  try {
    const latestLog = await AuditLog.findOne({}).sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Usa GET /api/prueba/migration/:runId para consultar una migración específica",
      latestRunId: latestLog?.runId || null,
      example: latestLog?.runId ? `/api/prueba/migration/${latestLog.runId}` : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};