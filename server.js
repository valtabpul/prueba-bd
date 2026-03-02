import express from 'express';
import 'dotenv/config';
import { pool } from './src/config/postgres.js';   // Tu archivo de Postgres
import { connectDB as connectMongo } from './src/config/mongodb.js'; // Tu archivo de MongoDB
import pruebaRoutes from './src/routes/pruebaRoutes.js'

const app = express();
app.use(express.json());

app.use('/api/prueba', pruebaRoutes); 

const startServer = async () => {
  try {
    // Probar Postgres ejecutando una consulta simple
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Postgres Conectado. Hora del servidor:', res.rows[0].now);

    // Probar Mongo
    await connectMongo();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('-------------------------------------------');
      console.log(`Servidor activo en puerto: ${PORT}`);
      console.log(`\n🟢 Base de Datos: PostgreSQL & MongoDB OK`);
      console.log('-------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el sistema:', error);
    process.exit(1); // Detener todo si las DB no conectan
  }
};

startServer();