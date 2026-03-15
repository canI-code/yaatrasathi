import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../ui/Loader';

/**
 * Renders children (or <Outlet />) only when the user is NOT authenticated.
 * Authenticated users are redirected to /dashboard.
 */
export default function GuestRoute() {
  const { session, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
