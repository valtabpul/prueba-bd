import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    runId: { type: String, index: true },// para agrupar una migración completa
    action: { type: String, enum: ["INSERT", "UPDATE", "DELETE"], required:true },
    table: { type: String, required: true },// tabla de Postgres afectada
    record: { type: Object, default: {} },// datos clave (id/email/sku/etc.)
    status: { type: String, enum: ["SUCCESS", "ERROR"], required: true },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("audit_logs", auditLogSchema);