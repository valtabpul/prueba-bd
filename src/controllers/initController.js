import { initPostgresSchema } from "../services/dbInitService.js";

export const initDb = async (req, res) => {
  const result = await initPostgresSchema();

  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.status(200).json(result);
};