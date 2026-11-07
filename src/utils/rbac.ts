// src/utils/rbac.ts
import type { AppModule, PermissionKey, UserPermissionsProfile } from '../types/rbac';

/**
 * Initial intended Main Admin identity for PlumTrips.
 *
 * NOTE: Production privileges MUST be verified and returned by the backend.
 * This constant is used only as an identifier for development test-profile alignment
 * and UI display/protection indicators.
 */
export const INITIAL_MAIN_ADMIN_EMAIL = 'utkarsh@plumtrips.com';

/**
 * All marketing modules in default order.
 */
export const ALL_MARKETING_MODULES: AppModule[] = [
  'cruises',
  'holidays',
  'offers',
  'blogs',
  'frontpage',
  'carousel',
];

/**
 * Checks if the user profile has access to a specific application module.
 * Strictly FAILS CLOSED: returns false if profile, accessibleModules, or permissions are missing.
 */
export function hasModuleAccess(
  profile: UserPermissionsProfile | null | undefined,
  module: AppModule
): boolean {
  if (!profile) return false;
  if (profile.status === 'suspended') return false;

  // Only a verified main admin bypasses the explicit module assignment.
  if (profile.isMainAdmin) {
    return true;
  }

  return Array.isArray(profile.accessibleModules) &&
    profile.accessibleModules.includes(module);
}

/**
 * Checks if the user profile has a specific action-level permission.
 * Strictly FAILS CLOSED.
 */
export function hasPermission(
  profile: UserPermissionsProfile | null | undefined,
  permission: PermissionKey
): boolean {
  if (!profile) return false;
  if (profile.status === 'suspended') return false;

  // Wildcard grants actions inside assigned modules; it does not grant modules.
  if (profile.isMainAdmin || profile.permissions?.includes('*')) {
    return true;
  }

  if (!Array.isArray(profile.permissions)) {
    return false;
  }

  return profile.permissions.includes(permission);
}

/**
 * Calculates the first module route the operator is authorized to visit.
 * Returns null if the user has no accessible modules.
 */
export function getFirstAccessibleModulePath(
  profile: UserPermissionsProfile | null | undefined
): string | null {
  if (!profile) return null;

  for (const mod of ALL_MARKETING_MODULES) {
    if (hasModuleAccess(profile, mod)) {
      return `/marketing-dash/${mod}`;
    }
  }

  return null;
}

/**
 * Normalizes user data into a clean UserPermissionsProfile.
 * Strictly fails closed if the backend does not return permission fields.
 *
 * An explicit development-only mock profile is supported ONLY if:
 * 1. Running in Vite dev mode (import.meta.env.DEV === true)
 * 2. Explicitly enabled via localStorage ('plum_dev_mock_rbac' === 'true')
 */
export function resolvePermissionsProfile(rawUser: any): UserPermissionsProfile | null {
  if (!rawUser || typeof rawUser !== 'object') {
    return null;
  }

  const email = (rawUser.email || '').trim().toLowerCase();

  // Explicit dev-only mock profile evaluation
  if (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.localStorage.getItem('plum_dev_mock_rbac') === 'true'
  ) {
    const mockRole = window.localStorage.getItem('plum_dev_mock_role') || 'main_admin';
    return getDevMockProfile(email, mockRole);
  }

  // Production path: strictly data-driven from backend response
  const isMainAdmin = Boolean(rawUser.isMainAdmin || rawUser.role === 'main_admin');
  const isProtected = Boolean(rawUser.isProtected);
  const accessibleModules = Array.isArray(rawUser.accessibleModules)
    ? (rawUser.accessibleModules as AppModule[])
    : isMainAdmin
    ? ALL_MARKETING_MODULES
    : [];

  const permissions = Array.isArray(rawUser.permissions)
    ? (rawUser.permissions as PermissionKey[])
    : isMainAdmin
    ? (['*'] as PermissionKey[])
    : [];

  return {
    userId: rawUser.id || rawUser._id,
    email: rawUser.email,
    fullName: rawUser.fullName,
    role: rawUser.role || (isMainAdmin ? 'main_admin' : 'viewer'),
    isMainAdmin,
    isProtected,
    accessibleModules,
    permissions,
    status: rawUser.status || 'active',
  };
}

/**
 * Development-only test mock profiles.
 * Never called in production builds.
 */
function getDevMockProfile(email: string, mockRole: string): UserPermissionsProfile {
  const isMain = mockRole === 'main_admin' || email === INITIAL_MAIN_ADMIN_EMAIL;

  if (isMain) {
    return {
      userId: 'dev-main-admin-id',
      email: email || INITIAL_MAIN_ADMIN_EMAIL,
      fullName: 'Utkarsh (Main Admin Dev Mock)',
      role: 'main_admin',
      isMainAdmin: true,
      isProtected: true,
      accessibleModules: [...ALL_MARKETING_MODULES, 'users'],
      permissions: ['*'],
      status: 'active',
    };
  }

  if (mockRole === 'blogs_viewer') {
    return {
      userId: 'dev-viewer-id',
      email: email || 'viewer@plumtrips.com',
      fullName: 'Blog Viewer (Dev Mock)',
      role: 'viewer',
      isMainAdmin: false,
      isProtected: false,
      accessibleModules: ['blogs'],
      permissions: ['blogs:view'],
      status: 'active',
    };
  }

  if (mockRole === 'blogs_editor') {
    return {
      userId: 'dev-editor-id',
      email: email || 'editor@plumtrips.com',
      fullName: 'Blog Editor (Dev Mock)',
      role: 'editor',
      isMainAdmin: false,
      isProtected: false,
      accessibleModules: ['blogs'],
      permissions: ['blogs:view', 'blogs:create', 'blogs:edit'],
      status: 'active',
    };
  }

  // Default: no permissions (fail closed)
  return {
    userId: 'dev-unauthorized-id',
    email: email || 'nobody@plumtrips.com',
    fullName: 'Unauthorized Operator (Dev Mock)',
    role: 'viewer',
    isMainAdmin: false,
    isProtected: false,
    accessibleModules: [],
    permissions: [],
    status: 'active',
  };
}