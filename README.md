# 🚀 Sistema de Migración de Datos - PostgreSQL & MongoDB

Sistema de migración de datos desde archivos CSV a PostgreSQL y MongoDB con auditoría completa.

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- MongoDB (v4 o superior)

## 🔧 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_bd

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nombre_bd
```

### 3. Crear las tablas en PostgreSQL

Ejecutar el script SQL ubicado en `data/scriptData.sql`:

```bash
psql -U usuario -d nombre_bd -f data/scriptData.sql
```

O desde PostgreSQL:

```sql
\i /ruta/al/proyecto/data/scriptData.sql
```

## 🗃️ Estructura de la Base de Datos

### PostgreSQL (Datos transaccionales)

- **customer**: Clientes (nombre, email, teléfono, dirección)
- **product_category**: Categorías de productos
- **supplier**: Proveedores
- **product**: Productos con SKU, nombre, precio y categoría
- **product_supplier**: Relación entre productos y proveedores
- **transactions**: Transacciones de venta
- **transaction_detail**: Detalles de cada transacción

### MongoDB (Auditoría)

- **audit_logs**: Registro de todas las operaciones realizadas durante la migración

## 🚀 Uso

### Iniciar el servidor

```bash
npm start
```

El servidor se iniciará en el puerto configurado (por defecto 3000).

### Ejecutar la migración

Realizar una petición POST al endpoint de migración:

```bash
curl -X POST http://localhost:3000/api/prueba/migrate
```

O usando herramientas como Postman, Thunder Client, etc.

### Respuesta de la migración

```json
{
  "success": true,
  "message": "Migración completada exitosamente",
  "runId": "uuid-generado",
  "statistics": {
    "totalRows": 79,
    "customers": 8,
    "categories": 3,
    "suppliers": 6,
    "products": 18,
    "productSuppliers": 25,
    "transactions": 18,
    "transactionDetails": 79,
    "errors": 0
  }
}
```

### Consultar el estado de una migración

```bash
curl http://localhost:3000/api/prueba/migration/{runId}
```

## 📊 Características

- ✅ Migración completa de datos CSV a PostgreSQL
- ✅ Auditoría automática en MongoDB de cada operación
- ✅ Prevención de duplicados mediante caché y constraints UNIQUE
- ✅ Manejo de errores con logs detallados
- ✅ Estadísticas completas de la migración
- ✅ Seguimiento de migraciones mediante runId único

## 🔍 Verificar la migración

### Consultar datos en PostgreSQL

```sql
-- Contar registros
SELECT 'customers' as tabla, COUNT(*) FROM customer
UNION ALL
SELECT 'productos', COUNT(*) FROM product
UNION ALL
SELECT 'transacciones', COUNT(*) FROM transactions;

-- Ver una transacción completa
SELECT 
  t.transaction_code,
  t.transaction_date,
  c.name as customer_name,
  p.product_name,
  td.quantity,
  td.unit_price,
  td.total_line_price
FROM transactions t
JOIN customer c ON t.customer_id = c.id
JOIN transaction_detail td ON t.id = td.transaction_id
JOIN product_supplier ps ON td.product_supplier_id = ps.id
JOIN product p ON ps.product_id = p.id
WHERE t.transaction_code = 'TXN-2001';
```

### Consultar auditoría en MongoDB

```javascript
// Conectar a MongoDB y ver los últimos logs
db.audit_logs.find().sort({ createdAt: -1 }).limit(10)

// Ver estadísticas por tabla
db.audit_logs.aggregate([
  { $group: { 
    _id: { table: "$table", status: "$status" }, 
    count: { $sum: 1 } 
  }}
])
```

## 📁 Estructura del Proyecto

```
prueba_BD/
├── data/
│   ├── AM-prueba-desempeno-data_m4.csv
│   └── scriptData.sql
├── src/
│   ├── config/
│   │   ├── mongodb.js
│   │   └── postgres.js
│   ├── controllers/
│   │   └── migrationController.js
│   ├── models/
│   │   └── auditLog.js
│   ├── routes/
│   │   └── pruebaRoutes.js
│   └── services/
│       ├── auditService.js
│       └── migrationService.js
├── .env
├── package.json
└── server.js
```

## 🛠️ Tecnologías Utilizadas

- **Express.js**: Framework web
- **PostgreSQL**: Base de datos relacional
- **MongoDB**: Base de datos NoSQL para auditoría
- **csv-parser**: Parser de archivos CSV
- **pg**: Driver de PostgreSQL
- **mongoose**: ODM para MongoDB

## ⚠️ Notas Importantes

- La migración puede ejecutarse múltiples veces sin crear duplicados gracias a las restricciones UNIQUE
- Cada ejecución genera un `runId` único para seguimiento
- Los errores se registran en MongoDB pero no detienen la migración completa
- El archivo CSV debe estar en la ruta `data/AM-prueba-desempeno-data_m4.csv`

## 👨‍💻 Desarrollo

Para ejecutar en modo desarrollo:

```bash
node --watch server.js
```

## 📝 Licencia

ISC
