// src/components/auth/PermissionGate.tsx
import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import type { PermissionKey } from '../../types/rbac';

interface PermissionGateProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * In-page capability gate.
 * Renders its children ONLY if the authenticated operator has the specified action permission(s).
 * Strictly fails closed: renders `fallback` (default null) if unpermitted.
 */
export default function PermissionGate({
  permission,
  anyOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = usePermission();

  const allowed = React.useMemo(() => {
    if (anyOf && anyOf.length > 0) {
      return anyOf.some((p) => hasPermission(p));
    }
    if (permission) {
      return hasPermission(permission);
    }
    return false;
  }, [permission, anyOf, hasPermission]);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}