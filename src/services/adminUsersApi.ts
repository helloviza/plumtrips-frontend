// src/services/adminUsersApi.ts
/**
 * Admin User Management API Service
 *
 * Implements the typed boundary between the PlumTrips frontend and the backend
 * user/RBAC management service.
 *
 * Backend status:
 * In development, if backend endpoints (/api/admin/users) are not yet implemented
 * or return 404/network errors, this service uses an explicit in-memory preview
 * mock adapter.
 *
 * Safety:
 * - Mock functionality strictly fails closed in production builds (`import.meta.env.PROD`).
 * - In dev preview mode, an indicator is exposed to the UI so mock changes are NEVER
 *   mistaken for server-saved data.
 * - Protected accounts (such as initial Main Admin) cannot be deleted, suspended, or demoted.
 */

import type { EmployeeUser, AppModule, PermissionKey, EmployeeRole } from '../types/rbac';

const BACKEND =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_ORIGIN ||
  'http://localhost:8080';

export interface InviteEmployeePayload {
  email: string;
  fullName: string;
  password: string;
  role: EmployeeRole;
  accessibleModules: AppModule[];
  permissions: PermissionKey[];
}

export interface UpdateEmployeePermissionsPayload {
  role?: EmployeeRole;
  accessibleModules: AppModule[];
  permissions: PermissionKey[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  isMockPreview?: boolean;
}

// Initial development preview seed
const DEV_INITIAL_EMPLOYEES: EmployeeUser[] = [
  {
    id: 'emp-admin-01',
    email: 'utkarsh@plumtrips.com',
    fullName: 'Utkarsh (Main Admin)',
    role: 'main_admin',
    isMainAdmin: true,
    isProtected: true,
    accessibleModules: ['blogs', 'cruises', 'holidays', 'offers', 'frontpage', 'carousel', 'users'],
    permissions: ['*'],
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-10-22T18:30:00Z',
  },
  {
    id: 'emp-blog-02',
    email: 'editorial.lead@plumtrips.com',
    fullName: 'Ananya Sharma',
    role: 'editor',
    isMainAdmin: false,
    isProtected: false,
    accessibleModules: ['blogs'],
    permissions: ['blogs:view', 'blogs:create', 'blogs:edit'],
    status: 'active',
    createdAt: '2026-02-10T11:20:00Z',
    lastLoginAt: '2026-10-21T14:15:00Z',
  },
  {
    id: 'emp-pub-03',
    email: 'publisher.desk@plumtrips.com',
    fullName: 'Rohit Mehta',
    role: 'publisher',
    isMainAdmin: false,
    isProtected: false,
    accessibleModules: ['blogs', 'cruises'],
    permissions: [
      'blogs:view', 'blogs:publish',
      'cruises:view'
    ],
    status: 'active',
    createdAt: '2026-03-01T10:00:00Z',
    lastLoginAt: '2026-10-20T08:45:00Z',
  },
  {
    id: 'emp-offer-04',
    email: 'campaigns@plumtrips.com',
    fullName: 'Pooja Verma',
    role: 'editor',
    isMainAdmin: false,
    isProtected: false,
    accessibleModules: ['offers', 'carousel', 'frontpage'],
    permissions: [
      'offers:view', 'offers:create', 'offers:edit',
      'carousel:view', 'carousel:create', 'carousel:edit',
      'frontpage:view'
    ],
    status: 'active',
    createdAt: '2026-04-12T16:00:00Z',
    lastLoginAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'emp-intern-05',
    email: 'intern.content@plumtrips.com',
    fullName: 'Karan Joshi',
    role: 'viewer',
    isMainAdmin: false,
    isProtected: false,
    accessibleModules: ['blogs'],
    permissions: ['blogs:view'],
    status: 'suspended',
    createdAt: '2026-06-01T09:30:00Z',
    lastLoginAt: '2026-09-15T10:00:00Z',
  },
];

// In-memory preview state for DEV mode only
let inMemoryDevEmployees: EmployeeUser[] = [...DEV_INITIAL_EMPLOYEES];

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const adminUsersApi = {
  /**
   * Fetch all employees and their permission profiles.
   */
  async getEmployees(): Promise<ApiResponse<EmployeeUser[]>> {
    try {
      const response = await http<{ users: EmployeeUser[] }>('/api/admin/users', { method: 'GET' });
      return {
        success: true,
        data: response.users || [],
        isMockPreview: false,
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        // Safe development preview fallback with simulated network latency
        await new Promise((r) => setTimeout(r, 200));
        return {
          success: true,
          data: [...inMemoryDevEmployees],
          isMockPreview: true,
          message: 'Displaying development mock preview data (Backend API unconfirmed)',
        };
      }
      throw err;
    }
  },

  /**
   * Invite/Add a new employee with designated role and module permissions.
   */
  async inviteEmployee(payload: InviteEmployeePayload): Promise<ApiResponse<EmployeeUser>> {
    try {
      const response = await http<{ user: EmployeeUser }>('/api/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        data: response.user,
        isMockPreview: false,
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 250));
        const newEmp: EmployeeUser = {
          id: `emp-dev-${Date.now()}`,
          email: payload.email.trim().toLowerCase(),
          fullName: payload.fullName.trim(),
          role: payload.role,
          isMainAdmin: false,
          isProtected: false,
          accessibleModules: payload.accessibleModules,
          permissions: payload.permissions,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: undefined,
        };
        inMemoryDevEmployees = [newEmp, ...inMemoryDevEmployees];
        return {
          success: true,
          data: newEmp,
          isMockPreview: true,
          message: 'Employee created in dev mock preview',
        };
      }
      throw err;
    }
  },

  /**
   * Update an employee's modules, role, and action-level permissions.
   */
  async updatePermissions(
    employeeId: string,
    payload: UpdateEmployeePermissionsPayload
  ): Promise<ApiResponse<EmployeeUser>> {
    try {
      const response = await http<{ user: EmployeeUser }>(`/api/admin/users/${employeeId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        data: response.user,
        isMockPreview: false,
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 200));
        const index = inMemoryDevEmployees.findIndex((e) => e.id === employeeId);
        if (index === -1) {
          throw new Error('Employee not found in dev mock state');
        }
        const existing = inMemoryDevEmployees[index];
        if (existing.isProtected) {
          throw new Error('Protected Main Admin account cannot have permissions modified');
        }

        const updated: EmployeeUser = {
          ...existing,
          role: payload.role || existing.role,
          accessibleModules: payload.accessibleModules,
          permissions: payload.permissions,
        };
        inMemoryDevEmployees[index] = updated;
        return {
          success: true,
          data: updated,
          isMockPreview: true,
          message: 'Permissions updated in dev mock preview',
        };
      }
      throw err;
    }
  },

  /**
   * Activate or suspend an employee account.
   */
  async toggleStatus(
    employeeId: string,
    newStatus: 'active' | 'suspended'
  ): Promise<ApiResponse<EmployeeUser>> {
    try {
      const response = await http<{ user: EmployeeUser }>(`/api/admin/users/${employeeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      return {
        success: true,
        data: response.user,
        isMockPreview: false,
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 150));
        const index = inMemoryDevEmployees.findIndex((e) => e.id === employeeId);
        if (index === -1) {
          throw new Error('Employee not found in dev mock state');
        }
        const existing = inMemoryDevEmployees[index];
        if (existing.isProtected) {
          throw new Error('Protected Main Admin account cannot be deactivated');
        }

        const updated: EmployeeUser = {
          ...existing,
          status: newStatus,
        };
        inMemoryDevEmployees[index] = updated;
        return {
          success: true,
          data: updated,
          isMockPreview: true,
          message: `Employee marked ${newStatus} in dev mock preview`,
        };
      }
      throw err;
    }
  },
};