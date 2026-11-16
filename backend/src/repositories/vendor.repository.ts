
import { dbQuery } from "../utils/dbQuery.js";

export interface Vendor {
  id: string;
  business_id: string;
  vendor_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export const getAllVendors = async (
  businessId: string
): Promise<Vendor[]> => {
  const result = await dbQuery<Vendor>(
    `SELECT
      id,
      business_id,
      vendor_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      is_active,
      created_at,
      updated_at
    FROM vend_vendors_biz_agent
    WHERE business_id = $1
    ORDER BY vendor_name ASC`,
    [businessId]
  );

  return result.rows;
};

export const getVendorById = async (
  vendorId: string,
  businessId: string
): Promise<Vendor | null> => {
  const result = await dbQuery<Vendor>(
    `SELECT
      id,
      business_id,
      vendor_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      is_active,
      created_at,
      updated_at
    FROM vend_vendors_biz_agent
    WHERE id = $1 AND business_id = $2`,
    [vendorId, businessId]
  );

  return result.rows[0] ?? null;
};
