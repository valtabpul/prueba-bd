import { pool } from "../config/postgres.js";

export const getPostgresCounts = async () => {
  const queries = {
    customer: "SELECT COUNT(*)::int AS count FROM customer",
    product_category: "SELECT COUNT(*)::int AS count FROM product_category",
    supplier: "SELECT COUNT(*)::int AS count FROM supplier",
    product: "SELECT COUNT(*)::int AS count FROM product",
    product_supplier: "SELECT COUNT(*)::int AS count FROM product_supplier",
    transactions: "SELECT COUNT(*)::int AS count FROM transactions",
    transaction_detail: "SELECT COUNT(*)::int AS count FROM transaction_detail",
  };

  const result = {};
  for (const [table, sql] of Object.entries(queries)) {
    const res = await pool.query(sql);
    result[table] = res.rows[0].count;
  }
  return result;
};