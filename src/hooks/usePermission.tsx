// src/hooks/usePermission.ts
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AppModule, PermissionKey, UserPermissionsProfile } from '../types/rbac';
import {
  hasModuleAccess,
  hasPermission,
  getFirstAccessibleModulePath,
  resolvePermissionsProfile,
} from '../utils/rbac';

export function usePermission() {
  const { user, loading } = useAuth();

  const profile: UserPermissionsProfile | null = useMemo(() => {
    return resolvePermissionsProfile(user);
  }, [user]);

  const checkModule = (module: AppModule): boolean => {
    return hasModuleAccess(profile, module);
  };

  const checkPermission = (permission: PermissionKey): boolean => {
    return hasPermission(profile, permission);
  };

  const firstAccessiblePath = useMemo(() => {
    return getFirstAccessibleModulePath(profile);
  }, [profile]);

  const canUploadImage = (module: 'blogs' | 'cruises' | 'holidays' | 'offers' | 'frontpage' | 'carousel'): boolean => {
    if (!profile) return false;
    if (profile.isMainAdmin || profile.permissions?.includes('*')) return true;
    // Image upload is allowed only as part of Create or Edit capabilities
    return hasPermission(profile, `${module}:create`) || hasPermission(profile, `${module}:edit`);
  };

  return {
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isMainAdmin: Boolean(profile?.isMainAdmin),
    isProtected: Boolean(profile?.isProtected),
    accessibleModules: profile?.accessibleModules || [],
    permissions: profile?.permissions || [],
    hasModuleAccess: checkModule,
    hasPermission: checkPermission,
    canUploadImage,
    firstAccessiblePath,
  };
}