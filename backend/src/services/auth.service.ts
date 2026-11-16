
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import {
  getUserByEmail,
  updateLastLogin,
  getUserById,
  updateUserPassword,
  incrementTokenVersion
} from "../repositories/auth.repository.js";


export interface AuthenticatedUser {
  id: string;
  business_id: string;
  role_id: string;
  full_name: string;
  email: string;
  role_name: string;
  business_name: string;
}

export interface LoginResult {
  user: AuthenticatedUser;
  token: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult> => {

  // Find the user by email
  const user = await getUserByEmail(email);

  if (!user || !user.password_hash) {
    throw new Error("Invalid email or password");
  }

  // Check whether the user account is active
  if (!user.is_active) {
    throw new Error("Your account is inactive");
  }

  // Check whether the business account is active
  if (!user.business_is_active) {
    throw new Error("Your business account is inactive");
  }

  // Verify the submitted password
  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  // Update the last successful login time
  await updateLastLogin(user.id);

  // Prepare authenticated user information
  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    business_id: user.business_id,
    role_id: user.role_id,
    full_name: user.full_name,
    email: user.email,
    role_name: user.role_name,
    business_name: user.business_name
  };

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      businessId: user.business_id,
      roleId: user.role_id,
      roleName: user.role_name,
      tokenVersion: user.token_version,
      businessTokenVersion: user.business_token_version
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    user: authenticatedUser,
    token
  };
};
export const changeUserPassword = async (
  userId: string,
  businessId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {

  // Retrieve authenticated user's account
  const user = await getUserById(userId, businessId);

  if (!user || !user.is_active || !user.business_is_active) {
    throw new Error("User account is unavailable");
  }

  // Verify current password
  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("Current password is incorrect");
  }

  // Prevent reuse of current password
  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current password");
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password in database
  await updateUserPassword(userId, passwordHash);

  // Invalidate previously issued JWTs
await incrementTokenVersion(userId, businessId);
};