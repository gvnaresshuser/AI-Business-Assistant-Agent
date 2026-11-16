
import { dbQuery } from "../utils/dbQuery.js";

// ============================================
// CUSTOMER INTERFACES
// ============================================

export interface Customer {
  id: string;
  business_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  customer_type: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateCustomerInput {
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  customer_type?: string | null;
}

export interface CustomerPaginationResult {
  customers: Customer[];
  total: number;
}

export interface CustomerStats {
  totalCustomers: number;
  customerTypes: {
    customer_type: string;
    count: number;
  }[];
}

export interface CustomerPurchase {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  order_date: Date;
  order_status: string | null;
  subtotal: string;
  discount_amount: string | null;
  tax_amount: string | null;
  shipping_amount: string | null;
  total_amount: string;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ============================================
// GET ALL CUSTOMERS
// ============================================

export const getAllCustomers = async (
  businessId: string
): Promise<Customer[]> => {
  const result = await dbQuery<Customer>(
    `SELECT
      id,
      business_id,
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      customer_type,
      created_at,
      updated_at
    FROM cust_customers_biz_agent
    WHERE business_id = $1
    ORDER BY customer_name ASC`,
    [businessId]
  );

  return result.rows;
};

// ============================================
// GET CUSTOMER BY ID
// ============================================

export const getCustomerById = async (
  customerId: string,
  businessId: string
): Promise<Customer | null> => {
  const result = await dbQuery<Customer>(
    `SELECT
      id,
      business_id,
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      customer_type,
      created_at,
      updated_at
    FROM cust_customers_biz_agent
    WHERE id = $1 AND business_id = $2
    LIMIT 1`,
    [customerId, businessId]
  );

  return result.rows[0] ?? null;
};

// ============================================
// GET CUSTOMERS WITH SEARCH AND PAGINATION
// ============================================

export const getCustomersPaginated = async (
  businessId: string,
  page: number,
  limit: number,
  search: string = "",
  customerType: string = "all"
): Promise<CustomerPaginationResult> => {
  const offset = (page - 1) * limit;
  const searchTerm = search.trim();

  const searchCondition = `
    AND (
      customer_name ILIKE '%' || $2 || '%'
      OR COALESCE(email, '') ILIKE '%' || $2 || '%'
      OR COALESCE(phone, '') ILIKE '%' || $2 || '%'
    )
  `;

  const typeCondition = `
    AND (
      $3 = 'all'
      OR customer_type = $3
    )
  `;

  const [customersResult, countResult] = await Promise.all([
    dbQuery<Customer>(
      `SELECT
        id,
        business_id,
        customer_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        customer_type,
        created_at,
        updated_at
      FROM cust_customers_biz_agent
      WHERE business_id = $1
      ${searchCondition}
      ${typeCondition}
      ORDER BY customer_name ASC
      LIMIT $4 OFFSET $5`,
      [businessId, searchTerm, customerType, limit, offset]
    ),

    dbQuery<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM cust_customers_biz_agent
       WHERE business_id = $1
       ${searchCondition}
       ${typeCondition}`,
      [businessId, searchTerm, customerType]
    ),
  ]);

  return {
    customers: customersResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
  };
};

// ============================================
// CREATE CUSTOMER
// ============================================

export const createCustomer = async (
  businessId: string,
  customer: CreateCustomerInput
): Promise<Customer> => {
  const result = await dbQuery<Customer>(
    `INSERT INTO cust_customers_biz_agent (
      business_id,
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      customer_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      businessId,
      customer.customer_name,
      customer.email ?? null,
      customer.phone ?? null,
      customer.address ?? null,
      customer.city ?? null,
      customer.state ?? null,
      customer.pincode ?? null,
      customer.customer_type ?? "Regular",
    ]
  );

  return result.rows[0];
};

// ============================================
// UPDATE CUSTOMER
// ============================================

export const updateCustomer = async (
  customerId: string,
  businessId: string,
  customer: CreateCustomerInput
): Promise<Customer | null> => {
  const result = await dbQuery<Customer>(
    `UPDATE cust_customers_biz_agent
     SET
       customer_name = $1,
       email = $2,
       phone = $3,
       address = $4,
       city = $5,
       state = $6,
       pincode = $7,
       customer_type = $8,
       updated_at = NOW()
     WHERE id = $9 AND business_id = $10
     RETURNING *`,
    [
      customer.customer_name,
      customer.email ?? null,
      customer.phone ?? null,
      customer.address ?? null,
      customer.city ?? null,
      customer.state ?? null,
      customer.pincode ?? null,
      customer.customer_type ?? "Regular",
      customerId,
      businessId,
    ]
  );

  return result.rows[0] ?? null;
};

// ============================================
// DELETE CUSTOMER
// ============================================

export const deleteCustomer = async (
  customerId: string,
  businessId: string
): Promise<boolean> => {
  const result = await dbQuery(
    `DELETE FROM cust_customers_biz_agent c
     WHERE c.id = $1
       AND c.business_id = $2
       AND NOT EXISTS (
         SELECT 1
         FROM sales_orders_biz_agent s
         WHERE s.customer_id = c.id
           AND s.business_id = c.business_id
       )
     RETURNING c.id`,
    [customerId, businessId]
  );

  return result.rowCount !== null && result.rowCount > 0;
};

// ============================================
// GET CUSTOMER STATISTICS
// ============================================

export const getCustomerStats = async (
  businessId: string
): Promise<CustomerStats> => {
  const [totalResult, typesResult] = await Promise.all([
    dbQuery<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM cust_customers_biz_agent
       WHERE business_id = $1`,
      [businessId]
    ),

    dbQuery<{
      customer_type: string;
      count: string;
    }>(
      `SELECT
        COALESCE(customer_type, 'Unspecified') AS customer_type,
        COUNT(*) AS count
       FROM cust_customers_biz_agent
       WHERE business_id = $1
       GROUP BY customer_type
       ORDER BY count DESC`,
      [businessId]
    ),
  ]);

  return {
    totalCustomers: Number(totalResult.rows[0]?.total ?? 0),
    customerTypes: typesResult.rows.map((row) => ({
      customer_type: row.customer_type,
      count: Number(row.count),
    })),
  };
};

// ============================================
// GET CUSTOMER PURCHASE HISTORY
// ============================================

export const getCustomerPurchaseHistory = async (
  customerId: string,
  businessId: string
): Promise<CustomerPurchase[]> => {
  const result = await dbQuery<CustomerPurchase>(
    `SELECT
      id,
      business_id,
      customer_id,
      order_number,
      order_date,
      order_status,
      subtotal,
      discount_amount,
      tax_amount,
      shipping_amount,
      total_amount,
      notes,
      created_at,
      updated_at
     FROM sales_orders_biz_agent
     WHERE customer_id = $1
       AND business_id = $2
     ORDER BY order_date DESC`,
    [customerId, businessId]
  );

  return result.rows;
};
