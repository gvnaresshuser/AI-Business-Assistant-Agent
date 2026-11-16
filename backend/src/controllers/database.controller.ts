import { Request, Response } from "express";
import { dbQuery } from "../utils/dbQuery.js";

export const checkDatabase = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await dbQuery<{
      database_name: string;
      current_time: Date;
    }>(
      "SELECT current_database() AS database_name, NOW() AS current_time"
    );

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
      database: result.rows[0]?.database_name,
      serverTime: result.rows[0]?.current_time
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Database connection unavailable"
    });
  }
};