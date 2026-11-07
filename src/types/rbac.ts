// src/types/rbac.ts
/**
 * Role-Based Access Control (RBAC) types for PlumTrips.
 *
 * Designed to be data-driven and dynamic, supporting variable user counts,
 * module-level access, and granular action-level capabilities.
 */

export type AppModule =
  | 'blogs'
  | 'cruises'
  | 'holidays'
  | 'offers'
  | 'frontpage'
  | 'carousel'
  | 'users'; // Main Admin operator management

export type BlogAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'publish';

export type MarketingAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete';

export type UserMgmtAction =
  | 'view'
  | 'invite'
  | 'edit_permissions'
  | 'toggle_status';

export type PermissionKey =
  | '*' // Superuser / Full Main Admin access
  | `blogs:${BlogAction}`
  | `cruises:${MarketingAction}`
  | `holidays:${MarketingAction}`
  | `offers:${MarketingAction}`
  | `frontpage:${MarketingAction}`
  | `carousel:${MarketingAction}`
  | `users:${UserMgmtAction}`;

export type EmployeeRole =
  | 'viewer'
  | 'editor'
  | 'publisher'
  | 'custom';

export type UserRole =
  | 'main_admin'
  | EmployeeRole;

export interface UserPermissionsProfile {
  userId?: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isMainAdmin: boolean;
  isProtected?: boolean; // Protected accounts (e.g., initial Main Admin) cannot be deleted/demoted
  accessibleModules: AppModule[];
  permissions: PermissionKey[];
  status?: 'active' | 'suspended';
}

export interface EmployeeUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isMainAdmin: boolean;
  isProtected: boolean;
  accessibleModules: AppModule[];
  permissions: PermissionKey[];
  status: 'active' | 'suspended';
  createdAt?: string;
  lastLoginAt?: string;
}
