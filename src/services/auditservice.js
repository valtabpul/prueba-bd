import { AuditLog } from "../models/auditLog.js";

export const logAudit = async ({ runId, action, table, record, status, error }) => {
  try {
    await AuditLog.create({
      runId,
      action,
      table,
      record,
      status,
      error: error ? String(error) : null,
    });
  } catch (e) {
    // No detener migración si falla el log
    console.error("!!Error guardando trazabilidad en Mongo:", e.message);
  }
};