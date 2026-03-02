import { pool } from "../config/postgres.js";

export const suppliersAnalysis = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id AS supplier_id,
        s.name AS supplier_name,
        s.email AS supplier_email,
        COALESCE(SUM(td.quantity), 0)::int AS items_sold,
        COALESCE(SUM(td.total_line_price), 0)::numeric(12,2) AS total_value
      FROM supplier s
      LEFT JOIN product_supplier ps ON ps.supplier_id = s.id
      LEFT JOIN transaction_detail td ON td.product_supplier_id = ps.id
      GROUP BY s.id, s.name, s.email
      ORDER BY items_sold DESC, total_value DESC;
    `);

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ suppliersAnalysis:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const customerPurchaseHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customerRes = await pool.query(
      `SELECT id, name, email FROM customer WHERE id = $1`,
      [customerId]
    );
    if (customerRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Cliente no encontrado" });
    }

    const result = await pool.query(
      `
      SELECT
        t.id AS transaction_id,
        t.transaction_code,
        t.transaction_date,
        SUM(td.total_line_price)::numeric(12,2) AS total_spent,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_sku', p.product_sku,
            'product_name', p.product_name,
            'quantity', td.quantity,
            'unit_price', td.unit_price,
            'total_line_price', td.total_line_price,
            'supplier', s.name
          )
          ORDER BY p.product_name
        ) AS items
      FROM transactions t
      JOIN transaction_detail td ON td.transaction_id = t.id
      JOIN product_supplier ps ON ps.id = td.product_supplier_id
      JOIN product p ON p.id = ps.product_id
      JOIN supplier s ON s.id = ps.supplier_id
      WHERE t.customer_id = $1
      GROUP BY t.id, t.transaction_code, t.transaction_date
      ORDER BY t.transaction_date DESC, t.transaction_code DESC;
      `,
      [customerId]
    );

    return res.json({
      success: true,
      customer: customerRes.rows[0],
      transactions: result.rows,
    });
  } catch (error) {
    console.error("❌ customerPurchaseHistory:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


// Productos más vendidos
export const topProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);

    const result = await pool.query(
      `
      SELECT
        p.id AS product_id,
        p.product_sku,
        p.product_name,
        pc.category_name,
        COALESCE(SUM(td.quantity),0)::int AS units_sold,
        COALESCE(SUM(td.total_line_price),0)::numeric(12,2) AS revenue
      FROM product p
      JOIN product_category pc ON pc.id = p.product_category_id
      LEFT JOIN product_supplier ps ON ps.product_id = p.id
      LEFT JOIN transaction_detail td ON td.product_supplier_id = ps.id
      WHERE pc.id = $1
      GROUP BY p.id, p.product_sku, p.product_name, pc.category_name
      ORDER BY revenue DESC, units_sold DESC
      LIMIT $2;
      `,
      [categoryId, limit]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ topProductsByCategory:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};