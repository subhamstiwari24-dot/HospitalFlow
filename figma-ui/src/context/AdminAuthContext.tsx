import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getAdminProfile,
  loginAdmin,
  logoutAdmin,
  ADMIN_TOKEN_KEY,
  type AdminProfile,
} from '../services/adminApi';

interface AdminAuthContextValue {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getAdminProfile(controller.signal)
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const login = async (employeeId: string, password: string) => {
    const response = await loginAdmin(employeeId, password);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, response.token);
    setAdmin(response);
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: admin !== null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return context;
}