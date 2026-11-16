
import { QueryResult, QueryResultRow, PoolClient } from "pg";
import { pool } from "../config/db.js";

export const dbQuery = async <T extends QueryResultRow = QueryResultRow>(
  query: string,
  params: unknown[] = []
): Promise<QueryResult<T>> => {
  try {
    const result = await pool.query<T>(query, params);
    return result;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
};

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
    throw error;
  } finally {
    client.release();
  }
};
