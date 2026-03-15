import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../ui/Loader';

/**
 * Renders children (or <Outlet />) only when the user is authenticated.
 * Unauthenticated users are redirected to /login with the current path
 * preserved as a `redirect` query param so they can be sent back after login.
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!session) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
