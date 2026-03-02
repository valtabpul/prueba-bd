import { pool } from "../config/postgres.js";
import { logAudit } from "./auditService.js";
import crypto from "crypto";

export const migrar = async (rows) => {
  const runId = crypto.randomUUID();

  for (const row of rows) {
    try {
      const res = await pool.query(
        "INSERT INTO customers(email) VALUES($1) RETURNING id",
        [row.customer_email]
      );

      await logAudit({
        runId,
        action: "INSERT",
        table: "customers",
        record: { id: res.rows[0].id, email: row.customer_email },
        status: "SUCCESS",
      });
    } catch (error) {
      await logAudit({
        runId,
        action: "INSERT",
        table: "customers",
        record: { email: row.customer_email },
        status: "ERROR",
        error,
      });
    }
  }

  return { runId };
};