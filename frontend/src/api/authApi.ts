import api from "./axios";

export interface AuthUser {
  userId: string;
  businessId: string;
  roleId: string;
  roleName: "Admin" | "Manager" | "Staff";
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Login
export const loginApi = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

// Get currently authenticated user
export const getCurrentUserApi = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>("/auth/me");

  return response.data;
};

// Logout
export const logoutApi = async (): Promise<void> => {
  await api.post("/auth/logout");
};