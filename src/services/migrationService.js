import { pool } from "../config/postgres.js";
import { logAudit } from "./auditservice.js";
import crypto from "crypto";

export const migrar = async (rows) => {
  const runId = crypto.randomUUID();
  let stats = {
    totalRows: rows.length,
    customers: 0,
    categories: 0,
    suppliers: 0,
    products: 0,
    productSuppliers: 0,
    transactions: 0,
    transactionDetails: 0,
    errors: 0
  };

  console.log(`\n🚀 Iniciando migración con runId: ${runId}`);
  console.log(`📊 Total de registros a procesar: ${rows.length}\n`);

  // Caches para evitar inserciones duplicadas
  const customerCache = new Map();
  const categoryCache = new Map();
  const supplierCache = new Map();
  const productCache = new Map();
  const productSupplierCache = new Map();
  const transactionCache = new Map();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`Procesando registro ${i + 1}/${rows.length} - TXN: ${row.transaction_id}`);

    try {
      // 1. Insertar o recuperar CUSTOMER
      let customerId;
      if (customerCache.has(row.customer_email)) {
        customerId = customerCache.get(row.customer_email);
      } else {
        const customerRes = await pool.query(
          `INSERT INTO customer(name, email, phone, address) 
           VALUES($1, $2, $3, $4) 
           ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [row.customer_name, row.customer_email, row.customer_phone, row.customer_address]
        );
        customerId = customerRes.rows[0].id;
        customerCache.set(row.customer_email, customerId);
        stats.customers++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "customer",
          record: { id: customerId, email: row.customer_email },
          status: "SUCCESS"
        });
      }

      //Insertar PRODUCT_CATEGORY
      let categoryId;
      if (categoryCache.has(row.product_category)) {
        categoryId = categoryCache.get(row.product_category);
      } else {
        const categoryRes = await pool.query(
          `INSERT INTO product_category(category_name) 
           VALUES($1) 
           ON CONFLICT (category_name) DO UPDATE SET category_name = EXCLUDED.category_name
           RETURNING id`,
          [row.product_category]
        );
        categoryId = categoryRes.rows[0].id;
        categoryCache.set(row.product_category, categoryId);
        stats.categories++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "product_category",
          record: { id: categoryId, category_name: row.product_category },
          status: "SUCCESS"
        });
      }

      //Insertar SUPPLIER
      let supplierId;
      if (supplierCache.has(row.supplier_email)) {
        supplierId = supplierCache.get(row.supplier_email);
      } else {
        const supplierRes = await pool.query(
          `INSERT INTO supplier(name, email) 
           VALUES($1, $2) 
           ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [row.supplier_name, row.supplier_email]
        );
        supplierId = supplierRes.rows[0].id;
        supplierCache.set(row.supplier_email, supplierId);
        stats.suppliers++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "supplier",
          record: { id: supplierId, email: row.supplier_email },
          status: "SUCCESS"
        });
      }

      //Insertar PRODUCT
      let productId;
      if (productCache.has(row.product_sku)) {
        productId = productCache.get(row.product_sku);
      } else {
        const productRes = await pool.query(
          `INSERT INTO product(product_sku, product_name, product_price, product_category_id) 
           VALUES($1, $2, $3, $4) 
           ON CONFLICT (product_sku) DO UPDATE SET product_sku = EXCLUDED.product_sku
           RETURNING id`,
          [row.product_sku, row.product_name, parseFloat(row.unit_price), categoryId]
        );
        productId = productRes.rows[0].id;
        productCache.set(row.product_sku, productId);
        stats.products++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "product",
          record: { id: productId, sku: row.product_sku },
          status: "SUCCESS"
        });
      }

      //Insertar PRODUCT_SUPPLIER
      const psKey = `${productId}-${supplierId}`;
      let productSupplierId;
      if (productSupplierCache.has(psKey)) {
        productSupplierId = productSupplierCache.get(psKey);
      } else {
        const psRes = await pool.query(
          `INSERT INTO product_supplier(product_id, supplier_id) 
           VALUES($1, $2) 
           ON CONFLICT (product_id, supplier_id) DO UPDATE SET product_id = EXCLUDED.product_id
           RETURNING id`,
          [productId, supplierId]
        );
        productSupplierId = psRes.rows[0].id;
        productSupplierCache.set(psKey, productSupplierId);
        stats.productSuppliers++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "product_supplier",
          record: { id: productSupplierId, product_id: productId, supplier_id: supplierId },
          status: "SUCCESS"
        });
      }

      //Insertar TRANSACTION
      let transactionId;
      if (transactionCache.has(row.transaction_id)) {
        transactionId = transactionCache.get(row.transaction_id);
      } else {
        const transactionRes = await pool.query(
          `INSERT INTO transactions(transaction_code, transaction_date, customer_id) 
           VALUES($1, $2, $3) 
           ON CONFLICT (transaction_code) DO UPDATE SET transaction_code = EXCLUDED.transaction_code
           RETURNING id`,
          [row.transaction_id, row.date, customerId]
        );
        transactionId = transactionRes.rows[0].id;
        transactionCache.set(row.transaction_id, transactionId);
        stats.transactions++;
        
        await logAudit({
          runId,
          action: "INSERT",
          table: "transactions",
          record: { id: transactionId, transaction_code: row.transaction_id },
          status: "SUCCESS"
        });
      }

      //Insertar TRANSACTION_DETAIL
      const detailRes = await pool.query(
        `INSERT INTO transaction_detail(transaction_id, product_supplier_id, quantity, unit_price, total_line_price) 
         VALUES($1, $2, $3, $4, $5) 
         ON CONFLICT (transaction_id, product_supplier_id) DO NOTHING
         RETURNING id`,
        [transactionId, productSupplierId, parseInt(row.quantity), parseFloat(row.unit_price), parseFloat(row.total_line_value)]
      );
      
      if (detailRes.rows.length > 0) {
        stats.transactionDetails++;
        await logAudit({
          runId,
          action: "INSERT",
          table: "transaction_detail",
          record: { id: detailRes.rows[0].id, transaction_id: transactionId },
          status: "SUCCESS"
        });
      }

    } catch (error) {
      stats.errors++;
      console.error(`❌ Error en registro ${i + 1}:`, error.message);
      
      await logAudit({
        runId,
        action: "INSERT",
        table: "migration_error",
        record: { row: i + 1, data: row },
        status: "ERROR",
        error: error.message
      });
    }
  }

  console.log(`\n✅ Migración completada con runId: ${runId}`);
  console.log('Estadísticas:');
  console.log(`   - Clientes insertados: ${stats.customers}`);
  console.log(`   - Categorías insertadas: ${stats.categories}`);
  console.log(`   - Proveedores insertados: ${stats.suppliers}`);
  console.log(`   - Productos insertados: ${stats.products}`);
  console.log(`   - Relaciones producto-proveedor: ${stats.productSuppliers}`);
  console.log(`   - Transacciones insertadas: ${stats.transactions}`);
  console.log(`   - Detalles de transacción: ${stats.transactionDetails}`);
  console.log(`   - Errores: ${stats.errors}\n`);

  return { runId, stats };
};