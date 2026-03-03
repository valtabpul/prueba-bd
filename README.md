# Data Migration System — PostgreSQL & MongoDB (Megastore)

This project migrates Megastore data from a CSV file into **PostgreSQL** (transactional data) and stores **audit logs** in **MongoDB** (migration/auditing).

---

## Recommended: Run with Docker (Ubuntu / New PC)

This is the recommended way to run the project on another PC. It starts:

- **PostgreSQL** (container)
- **MongoDB** (container)
- **API (Express/Node)** (container)

### 1) Requirements (Docker)
- Docker Engine
- Docker Compose plugin

Verify:
```bash
docker --version
docker compose version
```

### 2) Clone the repository
```bash
git clone https://github.com/valtabpul/prueba-bd.git
cd prueba-bd
```

### 3) If you already have an old version (update)
```bash
git checkout main
git pull origin main
```

### 4) Start the stack (build + run)
From the project root (where `docker-compose.yml` is):
```bash
docker compose up -d --build
```

Check status/logs:
```bash
docker compose ps
docker compose logs -f api
```

### 5) Ports used (Important)
According to `docker-compose.yml`:

- **API**: `http://localhost:3001`  (host `3001` → container `3000`)
- **PostgreSQL**: `localhost:5433`  (host `5433` → container `5432`)
- **MongoDB**: `localhost:27018`    (host `27018` → container `27017`)

### 6) PostgreSQL credentials (pgAdmin / clients)
Use these values in pgAdmin or any PostgreSQL client:

- Host: `localhost`
- Port: `5433`
- Username: `postgres`
- Password: `1234`

> Note: internally (inside Docker), the API connects to Postgres using the service name `postgres`.

### 7) (Optional) View the DB in pgAdmin
#### If pgAdmin is NOT installed
Install pgAdmin on Ubuntu (official installer or package manager depending on your Ubuntu version).

#### If pgAdmin IS installed: create a new server
1. Open pgAdmin
2. `Register > Server...`

**General**
- Name: `megastore-docker` (any name)

**Connection**
- Host name/address: `localhost`
- Port: `5433`
- Maintenance database: `postgres`
- Username: `postgres`
- Password: `1234`

Save.

### 8) Test endpoints with Postman (Docker)
Base URL:
- `http://localhost:3001`

**Run migration**
- Method: `POST`
- URL: `http://localhost:3001/api/prueba/migrate`
- Body: none

**BI endpoints**
- `GET http://localhost:3001/api/bi/suppliers/analysis`
- `GET http://localhost:3001/api/bi/customers/1/history`
- `GET http://localhost:3001/api/bi/categories/1/top-products?limit=10`

### 9) Stop / reset containers
Stop containers:
```bash
docker compose down
```

Stop + delete volumes (WARNING: deletes DB data):
```bash
docker compose down -v
```

---

## Troubleshooting: Port already in use (Ubuntu)

If Docker (or Node) fails because a port is already in use (example: `3001`, `5433`, `27018`):

### 1) Identify which process is using the port
Example (3001):
```bash
sudo lsof -i :3001
```

Alternative:
```bash
sudo ss -lntp | grep ':3001'
```

### 2) Kill the process (if you want to free the port)
If you get a PID:
```bash
sudo kill -9 <PID>
```

### 3) If the port is occupied by Docker
List containers:
```bash
docker ps
```

Stop your stack (from repo folder):
```bash
docker compose down
```

### 4) Alternative: change host ports in docker-compose.yml
Edit the left side (host port), for example:

- API: `"3001:3000"` → `"3002:3000"`
- Postgres: `"5433:5432"` → `"5434:5432"`
- Mongo: `"27018:27017"` → `"27019:27017"`

Then restart:
```bash
docker compose up -d --build
```

---

## Alternative: Run without Docker (Manual / Local)

Use this only if you want to run everything installed on your PC (Node + PostgreSQL + MongoDB locally).

### Prerequisites (Manual)
- Node.js (v14+)
- PostgreSQL (v12+)
- MongoDB (v4+)

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

### 3) Create PostgreSQL tables (manual mode)
Run the SQL script located at `data/scriptData.sql`:

```bash
psql -U user -d db_name -f data/scriptData.sql
```

Or inside `psql`:

```sql
\i /path/to/project/data/scriptData.sql
```

### 4) Start the server
```bash
npm start
```

API:
- `http://localhost:3000`

---

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

---

## Migration

### Run migration (Terminal)

**Docker**
```bash
curl -X POST "http://localhost:3001/api/prueba/migrate"
```

**Manual**
```bash
curl -X POST "http://localhost:3000/api/prueba/migrate"
```

### Run migration (Postman)

**Docker**
- Method: **POST**
- URL: `http://localhost:3001/api/prueba/migrate`

**Manual**
- Method: **POST**
- URL: `http://localhost:3000/api/prueba/migrate`

Body: *(none required)*

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

**Docker**
```bash
curl "http://localhost:3001/api/prueba/migration/{runId}"
```

**Manual**
```bash
curl "http://localhost:3000/api/prueba/migration/{runId}"
```

---

## BI (Business Intelligence) Endpoints

> These endpoints provide analytics queries based on the migrated PostgreSQL data.

> Base URL:
> - Docker: `http://localhost:3001`
> - Manual: `http://localhost:3000`

### 1) Supplier sales analysis
```bash
curl "http://localhost:3001/api/bi/suppliers/analysis"
```

### 2) Customer purchase history
```bash
curl "http://localhost:3001/api/bi/customers/1/history"
```
> Replace `1` with an existing `customerId`.

### 3) Top products by category
```bash
curl "http://localhost:3001/api/bi/categories/1/top-products?limit=10"
```
> Replace `1` with an existing `categoryId`.

---

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

---

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

---

## Project Structure

```text
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

---

## Tech Stack
- **Express.js (v5)** — Web framework
- **PostgreSQL** — Relational database
- **MongoDB** — NoSQL database (audit logs)
- **csv-parser** — CSV parsing
- **pg** — PostgreSQL driver
- **mongoose** — MongoDB ODM