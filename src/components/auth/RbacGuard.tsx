// src/components/auth/RbacGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import type { AppModule, PermissionKey } from '../../types/rbac';
import AccessDenied from './AccessDenied';

interface RbacGuardProps {
  children: React.ReactNode;
  module?: AppModule;
  requiredPermission?: PermissionKey;
  moduleLabel?: string;
  requireMainAdmin?: boolean;
}

export default function RbacGuard({
  children,
  module,
  requiredPermission,
  moduleLabel,
  requireMainAdmin = false,
}: RbacGuardProps) {
  const { loading, isAuthenticated, isMainAdmin, isProtected, hasModuleAccess, hasPermission } = usePermission();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#00477f]" />
          <p className="text-sm font-medium text-slate-500">Verifying authorization…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated operators are redirected to marketing login
  if (!isAuthenticated) {
    return <Navigate to="/marketing-login" replace />;
  }

  // Strict Main Admin check: requires both isMainAdmin and isProtected backend claims
  if (requireMainAdmin) {
    if (!isMainAdmin || !isProtected) {
      return (
        <AccessDenied
          moduleName={moduleLabel || "Manage Roles & Access"}
          requiredPermission={requiredPermission || "users:view"}
        />
      );
    }
  }

  // Check module-level access if specified
  if (module && !hasModuleAccess(module)) {
    return (
      <AccessDenied
        moduleName={moduleLabel || module}
        requiredPermission={requiredPermission}
      />
    );
  }

  // Check specific action permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <AccessDenied
        moduleName={moduleLabel || module}
        requiredPermission={requiredPermission}
      />
    );
  }

  return <>{children}</>;
}