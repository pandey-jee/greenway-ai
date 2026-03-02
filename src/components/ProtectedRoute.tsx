import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return fallback || <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
