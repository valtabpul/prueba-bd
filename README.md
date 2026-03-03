# Data Migration System — PostgreSQL & MongoDB (Megastore)

This project migrates Megastore data from a CSV file into **PostgreSQL** (transactional data) and stores **audit logs** in **MongoDB** (migration/auditing).

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- MongoDB (v4+)

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create a `.env` file in the project root:

```env
# Server Port
PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

# MongoDB
MONGODB_URI=mongodb://localhost:27017/db_name
```

### 3) Create PostgreSQL tables

Run the SQL script located at `data/scriptData.sql`:

```bash
psql -U user -d db_name -f data/scriptData.sql
```

Or inside `psql`:

```sql
\i /path/to/project/data/scriptData.sql
```

## NPM Scripts

- **Start server**
  ```bash
  npm start
  ```

- **Start server (dev / auto-reload)**
  ```bash
  npm run dev
  ```

- **Test DB connections**
  ```bash
  npm run test:connection
  ```

## Running the Server

Start the server in the VS Code terminal:

```bash
npm start
```

The API will run at:

- `http://localhost:3000`

## Migration

### Run migration (VS Code terminal)

```bash
curl -X POST "http://localhost:3000/api/prueba/migrate"
```

### Run migration (Postman)

- Method: **POST**
- URL: `http://localhost:3000/api/prueba/migrate`
- Body: *(none required)*

### Example response

```json
{
  "success": true,
  "message": "Migration completed successfully",
  "runId": "generated-uuid",
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

### Get migration status by runId (if implemented)

**Terminal**
```bash
curl "http://localhost:3000/api/prueba/migration/{runId}"
```

**Postman**
- Method: **GET**
- URL: `http://localhost:3000/api/prueba/migration/{runId}`

## BI (Business Intelligence) Endpoints

> These endpoints provide analytics queries based on the migrated PostgreSQL data.

### 1) Supplier sales analysis

**Terminal**
```bash
curl "http://localhost:3000/api/bi/suppliers/analysis"
```

**Postman**
- Method: **GET**
- URL: `http://localhost:3000/api/bi/suppliers/analysis`

### 2) Customer purchase history

**Terminal**
```bash
curl "http://localhost:3000/api/bi/customers/1/history"
```

**Postman**
- Method: **GET**
- URL: `http://localhost:3000/api/bi/customers/1/history`

> Replace `1` with an existing `customerId`.

### 3) Top products by category

**Terminal**
```bash
curl "http://localhost:3000/api/bi/categories/1/top-products?limit=10"
```

**Postman**
- Method: **GET**
- URL: `http://localhost:3000/api/bi/categories/1/top-products?limit=10`

> Replace `1` with an existing `categoryId`.

## Database Structure

### PostgreSQL (Transactional data)

- **customer**: Customers (name, email, phone, address)
- **product_category**: Product categories
- **supplier**: Suppliers
- **product**: Products (SKU, name, price, category)
- **product_supplier**: Product-supplier relationship
- **transactions**: Sales transactions
- **transaction_detail**: Transaction line items

### MongoDB (Auditing)

- **audit_logs**: Stores migration operations and status logs

## Verify the Migration

### PostgreSQL checks

```sql
SELECT 'customers' AS table, COUNT(*) FROM customer
UNION ALL
SELECT 'products', COUNT(*) FROM product
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
```

### MongoDB checks

```javascript
db.audit_logs.find().sort({ createdAt: -1 }).limit(10)
```

## Project Structure

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
│   ├── services/
│   │   ├── auditService.js
│   │   └── migrationService.js
│   └── routes/
│       ├── biRoutes.js
│       └── productRoutes.js
├── .env
├── package.json
└── server.js
```

## Tech Stack

- **Express.js (v5)** — Web framework
- **PostgreSQL** — Relational database
- **MongoDB** — NoSQL database (audit logs)
- **csv-parser** — CSV parsing
- **pg** — PostgreSQL driver
- **mongoose** — MongoDB ODM