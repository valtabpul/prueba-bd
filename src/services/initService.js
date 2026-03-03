import fs from "fs";
import path from "path";
import pg from "pg";
import "dotenv/config";

const { Client } = pg;

export const ensureDatabaseAndSchema = async () => {
  const adminUrl = process.env.POSTGRES_ADMIN_URL; // conecta a la DB "postgres"
  const appUrl = process.env.DATABASE_URL;         // conecta a la DB "megastore"
  const dbName = process.env.POSTGRES_DB_NAME || "megastore";

  if (!adminUrl || !appUrl) {
    return {
      success: false,
      error: "Faltan variables .env: POSTGRES_ADMIN_URL y/o DATABASE_URL",
    };
  }

  // A) Crear la base de datos si no existe
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();

  const { rowCount } = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
  }

  await admin.end();

  // B) Crear tablas ejecutando el SQL dentro de la DB final
  const sql = fs.readFileSync(path.join("data", "scriptData.sql"), "utf8");

  const db = new Client({ connectionString: appUrl });
  await db.connect();
  await db.query(sql);
  await db.end();

  return {
    success: true,
    message: `Base '${dbName}' lista y tablas creadas (data/scriptData.sql)`,
  };
};