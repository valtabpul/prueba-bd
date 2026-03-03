import fs from "fs";
import { pool } from "../config/postgres.js";

export const initPostgresSchema = async () => {
  // read SQL file (drops + creates tables)
  const sql = fs.readFileSync("data/scriptData.sql", "utf8");

  try {
    await pool.query(sql);
    return {
      success: true,
      message: "DB initialized (DROP + CREATE executed from data/scriptData.sql)"
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};