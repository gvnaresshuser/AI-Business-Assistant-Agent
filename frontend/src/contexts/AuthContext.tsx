import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  type AuthUser,
  type LoginCredentials,
} from "../api/authApi";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUserApi();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCurrentUser();
  }, []);

 const login = async (credentials: LoginCredentials) => {
   await loginApi(credentials);

   const response = await getCurrentUserApi();

   setUser(response.user);
   setLoggingOut(false);
 };

const logout = async () => {
  setLoggingOut(true);

  try {
    await logoutApi();
  } finally {
    setUser(null);
  }
};

  return (
    <AuthContext.Provider value={{ user, loading, loggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
