import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProtectedAdminRoute() {
  const { isAuthenticated, loading, admin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center text-[#526176] text-[14px]">
        Checking admin session...
      </div>
    );
  }

  // Allow both normal ADMIN and SUPER_ADMIN
  if (
    !isAuthenticated ||
    (admin?.role !== 'ADMIN' && admin?.role !== 'SUPER_ADMIN')
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}