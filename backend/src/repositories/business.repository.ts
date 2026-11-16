
import { dbQuery } from "../utils/dbQuery.js";

export interface Business {
  id: string;
  business_name: string;
  business_type: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string | null;
  tax_number: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export const getBusinessById = async (
  id: string
): Promise<Business | null> => {
  const result = await dbQuery<Business>(
    `SELECT
      id,
      business_name,
      business_type,
      email,
      phone,
      address,
      currency,
      tax_number,
      is_active,
      created_at,
      updated_at
    FROM biz_businesses_biz_agent
    WHERE id = $1
    LIMIT 1`,
    [id]
  );

  return result.rows[0] ?? null;
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  const result = await dbQuery<Business>(
    `SELECT
      id,
      business_name,
      business_type,
      email,
      phone,
      address,
      currency,
      tax_number,
      is_active,
      created_at,
      updated_at
    FROM biz_businesses_biz_agent
    ORDER BY created_at DESC`
  );

  return result.rows;
};
