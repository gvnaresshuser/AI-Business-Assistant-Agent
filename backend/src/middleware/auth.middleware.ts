
import type {
  Request,
  Response,
  NextFunction
} from "express";

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getUserById } from "../repositories/auth.repository.js";

export interface AuthenticatedRequestUser {
  userId: string;
  businessId: string;
  roleId: string;
  roleName: string;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Read JWT from HTTP-only cookie
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.businessId !== "string" ||
      typeof decoded.roleId !== "string" ||
      typeof decoded.roleName !== "string" ||
      typeof decoded.tokenVersion !== "number" ||
      !Number.isInteger(decoded.tokenVersion) ||
      typeof decoded.businessTokenVersion !== "number" ||
      !Number.isInteger(decoded.businessTokenVersion)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
      return;
    }

    // Retrieve the latest user and business information
    const user = await getUserById(
      decoded.userId,
      decoded.businessId
    );

    if (
      !user ||
      !user.is_active ||
      !user.business_is_active
    ) {
      res.status(401).json({
        success: false,
        message: "User account is inactive or unavailable"
      });
      return;
    }

    // Compare JWT version with database version
    if (decoded.tokenVersion !== user.token_version) {
      res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
      return;
    }

    // Compare business token version with database version
    if (
      decoded.businessTokenVersion !== user.business_token_version
    ) {
      res.status(401).json({
        success: false,
        message: "Business session expired. Please log in again."
      });
      return;
    }

    // Attach authenticated identity to Express request
    req.user = {
      userId: user.id,
      businessId: user.business_id,
      roleId: user.role_id,
      roleName: user.role_name
    };

    next();

  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token"
      });
      return;
    }

    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Authentication processing failed"
    });
  }
};
