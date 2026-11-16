
import type { PoolClient } from "pg";
import { pool } from "../config/db.js";

export const dbTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database Transaction Error:", error);
    throw error;

  } finally {
    client.release();
  }
};
