import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./src/config/postgres.js";
import { connectDB } from "./src/config/mongodb.js";
import pruebaRoutes from "./src/routes/pruebaRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import biRoutes from "./src/routes/biRoutes.js";

console.log("typeof pruebaRoutes:", typeof pruebaRoutes);
console.log("typeof productRoutes:", typeof productRoutes);
console.log("typeof biRoutes:", typeof biRoutes);

const app = express();

app.get("/__ping", (req, res) => res.json({ ok: true, from: "original server.js" }));

app.use(cors());
app.use(express.json());
//app.get("/__ping", (req, res) => res.json({ ok: true, from: "server.js" }));
console.log("Mounting routes now...");
app.use("/api/products", productRoutes);
app.use("/api/bi", biRoutes);
app.use("/api/prueba", pruebaRoutes);

console.log("Routes mounted: /api/products, /api/bi, /api/prueba");



const startServer = async () => {
  try {
    // 1) Probar Postgres
    const res = await pool.query("SELECT NOW()");
    console.log("\nPostgres conectado. Hora:", res.rows[0].now);
    console.log("=== RUNNING THIS server.js (WITH BI) ===");

    // 2) Conectar Mongo
    await connectDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`Endpoints:`);
      console.log(`  POST  http://localhost:${PORT}/api/prueba/migrate`);
      console.log(`  GET  http://localhost:${PORT}/api/bi/suppliers/analysis`);
      console.log(`  GET  http://localhost:${PORT}/api/bi/customers/1/history`)
      console.log(`  GET  http://localhost:${PORT}/api/bi/categories/1/top-products?limit=10`);
    });
  } catch (error) {
    console.error("❌ Error fatal iniciando el servidor:", error.message);
    process.exit(1);
  }
};

startServer();