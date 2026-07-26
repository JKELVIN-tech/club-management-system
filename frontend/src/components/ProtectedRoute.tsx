import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { member, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate">
        Loading…
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(member.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
