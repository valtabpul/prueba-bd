import { pool } from "../config/postgres.js";
import { DeletedLog } from "../models/deletedLog.js";

export const listProducts = async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, pc.category_name
     FROM product p
     JOIN product_category pc ON pc.id = p.product_category_id
     ORDER BY p.id`
  );
  res.json({ success: true, data: result.rows });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`SELECT * FROM product WHERE id = $1`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Producto no encontrado" });
  res.json({ success: true, data: result.rows[0] });
};

export const createProduct = async (req, res) => {
  const { product_sku, product_name, product_price, product_category_id } = req.body;

  const result = await pool.query(
    `INSERT INTO product(product_sku, product_name, product_price, product_category_id)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [product_sku, product_name, product_price, product_category_id]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { product_sku, product_name, product_price, product_category_id } = req.body;

  const result = await pool.query(
    `UPDATE product
     SET product_sku = $1,
         product_name = $2,
         product_price = $3,
         product_category_id = $4
     WHERE id = $5
     RETURNING *`,
    [product_sku, product_name, product_price, product_category_id, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Producto no encontrado" });
  res.json({ success: true, data: result.rows[0] });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  // snapshot
  const snapshotRes = await pool.query(`SELECT * FROM product WHERE id = $1`, [id]);
  if (snapshotRes.rows.length === 0) {
    return res.status(404).json({ success: false, error: "Producto no encontrado" });
  }

  // delete (puede fallar si hay FK)
  try {
    await pool.query(`DELETE FROM product WHERE id = $1`, [id]);
  } catch (e) {
    return res.status(409).json({
      success: false,
      error: "No se puede eliminar: el producto está referenciado por otras tablas",
      detail: e.message,
    });
  }

  // log en Mongo
  await DeletedLog.create({
    entity: "product",
    entityId: Number(id),
    snapshot: snapshotRes.rows[0],
  });

  res.json({ success: true, message: "Producto eliminado y registrado en Mongo (deleted_logs)" });
};