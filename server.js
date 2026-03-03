import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./src/config/mongodb.js";
import pruebaRoutes from "./src/routes/pruebaRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import biRoutes from "./src/routes/biRoutes.js";
import initRoutes from "./src/routes/initRoutes.js";

import { ensureDatabaseAndSchema } from "./src/services/initService.js";

const app = express();

app.use(cors());
app.use(express.json());

console.log("Rutas...");
app.use("/api/products", productRoutes);
app.use("/api/bi", biRoutes);
app.use("/api/prueba", pruebaRoutes);
app.use("/api", initRoutes);

const startServer = async () => {
  try {
    // 1) Asegurar DB + schema ANTES de usar el pool
    const init = await ensureDatabaseAndSchema();
    if (!init.success) {
      throw new Error(init.error || "Fallo inicializando DB");
    }

    // 2) Importar/crear pool después de que exista la DB
    const { pool } = await import("./src/config/postgres.js");

    // 3) Probar Postgres
    const res = await pool.query("SELECT NOW()");
    console.log("\nPostgres conectado. Hora:", res.rows[0].now);

    // 4) Conectar Mongo
    await connectDB();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}\n`);
      console.log(`Endpoints:\n`);
      console.log(`  POST http://localhost:${PORT}/api/init-db`);
      console.log(`  POST http://localhost:${PORT}/api/prueba/migrate`);
      console.log(`  GET  http://localhost:${PORT}/api/bi/suppliers/analysis`);
      console.log(`  GET  http://localhost:${PORT}/api/bi/customers/1/history`);
      console.log(`  GET  http://localhost:${PORT}/api/bi/categories/1/top-products?limit=10`);
    });
  } catch (error) {
    console.error("❌ Error fatal iniciando el servidor:", error.message);
    process.exit(1);
  }
};

startServer();