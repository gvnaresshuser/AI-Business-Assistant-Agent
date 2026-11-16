
import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on("connect", () => {
  console.log("PostgreSQL client connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time, current_database() AS database_name"
    );

    console.log("Database Connected Successfully!");
    console.log("Database:", result.rows[0].database_name);
    console.log("Server Time:", result.rows[0].current_time);
  } catch (error) {
    console.error("Database Connection Failed:", error);
    throw error;
  }
};
