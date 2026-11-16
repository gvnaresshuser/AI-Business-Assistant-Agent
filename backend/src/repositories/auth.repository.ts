
import { dbQuery } from "../utils/dbQuery.js";

export interface AuthUser {
  id: string;
  business_id: string;
  role_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  is_active: boolean | null;
  role_name: string;
  business_name: string;
  business_is_active: boolean | null;
  token_version: number;
  business_token_version: number;
}

export const getUserByEmail = async (
  email: string
): Promise<AuthUser | null> => {
  const result = await dbQuery<AuthUser>(
    `SELECT
      u.id,
      u.business_id,
      u.role_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_active,
      u.token_version,      
      r.role_name,
      b.business_name,
      b.is_active AS business_is_active,
      b.token_version AS business_token_version
    FROM auth_users_biz_agent u
    INNER JOIN auth_roles_biz_agent r
      ON r.id = u.role_id
     AND r.business_id = u.business_id
    INNER JOIN biz_businesses_biz_agent b
      ON b.id = u.business_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1`,
    [email.trim()]
  );

  return result.rows[0] ?? null;
};

export const updateLastLogin = async (
  userId: string
): Promise<void> => {
  await dbQuery(
    `UPDATE auth_users_biz_agent
     SET last_login_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  );
};

export const updateUserPassword = async (
  userId: string,
  passwordHash: string
): Promise<void> => {
  await dbQuery(
    `UPDATE auth_users_biz_agent
     SET password_hash = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, userId]
  );
};

export const getUserById = async (
  userId: string,
  businessId: string
): Promise<AuthUser | null> => {
  const result = await dbQuery<AuthUser>(
    `SELECT
      u.id,
      u.business_id,
      u.role_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_active,
      u.token_version,
      r.role_name,
      b.business_name,
      b.is_active AS business_is_active,
      b.token_version AS business_token_version
    FROM auth_users_biz_agent u
    INNER JOIN auth_roles_biz_agent r
      ON r.id = u.role_id
     AND r.business_id = u.business_id
    INNER JOIN biz_businesses_biz_agent b
      ON b.id = u.business_id
    WHERE u.id = $1
      AND u.business_id = $2
    LIMIT 1`,
    [userId, businessId]
  );

  return result.rows[0] ?? null;
};
export const incrementTokenVersion = async (
  userId: string,
  businessId: string
): Promise<void> => {
  await dbQuery(
    `UPDATE auth_users_biz_agent
     SET token_version = token_version + 1,
         updated_at = NOW()
     WHERE id = $1
       AND business_id = $2`,
    [userId, businessId]
  );
};
