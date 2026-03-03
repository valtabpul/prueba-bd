import { ensureDatabaseAndSchema} from "../services/initService.js";

export const initDb = async (req, res) => {
  const result = await ensureDatabaseAndSchema();

  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.status(200).json(result);
};