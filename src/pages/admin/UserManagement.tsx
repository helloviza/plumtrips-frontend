import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Lock,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminUsersApi } from '../../services/adminUsersApi';
import type { EmployeeUser, AppModule, PermissionKey, EmployeeRole } from '../../types/rbac';

interface ModuleConfig {
  id: AppModule;
  label: string;
  description: string;
  actions: { key: string; label: string }[];
}

const MANAGEABLE_MODULES: ModuleConfig[] = [
  {
    id: 'blogs',
    label: 'Blogs & Editorial',
    description: 'Travel articles, blogs editor, rich text, categories, & publications',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'publish', label: 'Publish' },
    ],
  },
  {
    id: 'cruises',
    label: 'Cruises',
    description: 'Cruise itineraries, cabin types, pricing, & deck plans',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
  },
  {
    id: 'holidays',
    label: 'Holiday Packages',
    description: 'Tour packages, seasonal trips, itineraries, & pricing',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
  },
  {
    id: 'offers',
    label: 'Offers & Promotions',
    description: 'Promotional discount banners, coupons, & holiday specials',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
  },
  {
    id: 'frontpage',
    label: 'Frontpage Curation',
    description: 'Hero banners, trending destinations, & homepage highlights',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
  },
  {
    id: 'carousel',
    label: 'Home Carousel',
    description: 'Homepage dynamic slide reels, CTA buttons, & carousel graphics',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'create', label: 'Create' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
    ],
  },
];

const MODULE_LABELS = Object.fromEntries(
  MANAGEABLE_MODULES.map(({ id, label }) => [id, label])
) as Record<AppModule, string>;

/**
 * Computes default action permissions for a template role across given modules.
 * Note:
 * - 'viewer': view only
 * - 'editor': view + create + edit (image upload enabled via create/edit)
 * - 'publisher': view + publish (where applicable, e.g. blogs). Does NOT grant create/edit.
 * - 'custom': preserves current permissions without altering them
 */
function computeRolePresetPermissions(
  role: EmployeeRole,
  modules: AppModule[],
  currentPerms: PermissionKey[]
): PermissionKey[] {
  if (role === 'custom') {
    return currentPerms;
  }

  const perms: PermissionKey[] = [];
  for (const mod of modules) {
    perms.push(`${mod}:view` as PermissionKey);

    if (role === 'editor') {
      perms.push(`${mod}:create` as PermissionKey);
      perms.push(`${mod}:edit` as PermissionKey);
    } else if (role === 'publisher') {
      if (mod === 'blogs') {
        perms.push('blogs:publish');
      }
    }
  }
  return perms;
}

export default function UserManagement() {
  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockPreview, setIsMockPreview] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null);
  const [statusToggleTarget, setStatusToggleTarget] = useState<EmployeeUser | null>(null);

  // Discard Confirmation Modal
  const [pendingDiscardAction, setPendingDiscardAction] = useState<(() => void) | null>(null);

  // Form states for Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<EmployeeRole>('editor');
  const [inviteModules, setInviteModules] = useState<AppModule[]>(['blogs']);
  const [invitePermissions, setInvitePermissions] = useState<PermissionKey[]>([
    'blogs:view',
    'blogs:create',
    'blogs:edit',
  ]);

  // Initial snapshot references for dirty tracking
  const initialEditSnapshot = useRef<string>('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminUsersApi.getEmployees();
      setEmployees(res.data);
      setIsMockPreview(Boolean(res.isMockPreview));
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  // Check if Invite modal is dirty
  const isInviteDirty = useMemo(() => {
    return (
      inviteName.trim().length > 0 ||
      inviteEmail.trim().length > 0 ||
      invitePassword.length > 0 ||
      inviteRole !== 'editor' ||
      JSON.stringify(inviteModules) !== JSON.stringify(['blogs']) ||
      JSON.stringify(invitePermissions.slice().sort()) !==
        JSON.stringify(['blogs:view', 'blogs:create', 'blogs:edit'].sort())
    );
  }, [inviteName, inviteEmail, invitePassword, inviteRole, inviteModules, invitePermissions]);

  // Check if Edit modal is dirty
  const isEditDirty = useMemo(() => {
    if (!editingEmployee || !initialEditSnapshot.current) return false;
    const currentSnapshot = JSON.stringify({
      role: editingEmployee.role,
      modules: [...editingEmployee.accessibleModules].sort(),
      permissions: [...editingEmployee.permissions].sort(),
    });
    return currentSnapshot !== initialEditSnapshot.current;
  }, [editingEmployee]);

  // Safe dismiss for Invite modal
  const handleRequestCloseInvite = () => {
    if (isInviteDirty) {
      setPendingDiscardAction(() => () => {
        setIsInviteOpen(false);
        setInviteEmail('');
        setInviteName('');
        setInvitePassword('');
        setInviteRole('editor');
        setInviteModules(['blogs']);
        setInvitePermissions(['blogs:view', 'blogs:create', 'blogs:edit']);
      });
    } else {
      setIsInviteOpen(false);
    }
  };

  // Safe dismiss for Edit modal
  const handleRequestCloseEdit = () => {
    if (isEditDirty) {
      setPendingDiscardAction(() => () => {
        setEditingEmployee(null);
        initialEditSnapshot.current = '';
      });
    } else {
      setEditingEmployee(null);
      initialEditSnapshot.current = '';
    }
  };

  // Start editing employee with snapshot
  const handleStartEdit = (emp: EmployeeUser) => {
    initialEditSnapshot.current = JSON.stringify({
      role: emp.role,
      modules: [...emp.accessibleModules].sort(),
      permissions: [...emp.permissions].sort(),
    });
    setEditingEmployee({ ...emp });
  };

  // Change invite role template with auto-preset
  const handleInviteRoleChange = (newRole: EmployeeRole) => {
    setInviteRole(newRole);
    if (newRole !== 'custom') {
      const preset = computeRolePresetPermissions(newRole, inviteModules, invitePermissions);
      setInvitePermissions(preset);
    }
  };

  // Change edit role template with auto-preset
  const handleEditRoleChange = (newRole: EmployeeRole) => {
    if (!editingEmployee) return;
    const nextPerms =
      newRole !== 'custom'
        ? computeRolePresetPermissions(
            newRole,
            editingEmployee.accessibleModules,
            editingEmployee.permissions
          )
        : editingEmployee.permissions;

    setEditingEmployee({
      ...editingEmployee,
      role: newRole,
      permissions: nextPerms,
    });
  };

  // Handle module toggle in editor/invite
  const handleToggleModule = (
    modId: AppModule,
    targetRole: EmployeeRole,
    targetModules: AppModule[],
    setTargetModules: (m: AppModule[]) => void,
    targetPermissions: PermissionKey[],
    setTargetPermissions: (p: PermissionKey[]) => void
  ) => {
    if (targetModules.includes(modId)) {
      // Remove module and all its permissions
      const nextMods = targetModules.filter((m) => m !== modId);
      setTargetModules(nextMods);
      setTargetPermissions(
        targetPermissions.filter((p) => !p.startsWith(`${modId}:`))
      );
    } else {
      // Add module and apply preset actions according to selected role
      const nextMods = [...targetModules, modId];
      setTargetModules(nextMods);

      if (targetRole !== 'custom') {
        const nextPerms = computeRolePresetPermissions(targetRole, nextMods, targetPermissions);
        setTargetPermissions(nextPerms);
      } else {
        const defaultView = `${modId}:view` as PermissionKey;
        if (!targetPermissions.includes(defaultView)) {
          setTargetPermissions([...targetPermissions, defaultView]);
        }
      }
    }
  };

  // Handle action permission toggle
  const handleToggleActionPermission = (
    permKey: PermissionKey,
    modId: AppModule,
    targetModules: AppModule[],
    setTargetModules: (m: AppModule[]) => void,
    targetPermissions: PermissionKey[],
    setTargetPermissions: (p: PermissionKey[]) => void
  ) => {
    // If enabling an action, ensure parent module and view are also included
    if (!targetPermissions.includes(permKey)) {
      const nextModules = targetModules.includes(modId)
        ? targetModules
        : [...targetModules, modId];
      setTargetModules(nextModules);

      const nextPerms = [...targetPermissions, permKey];
      const viewPerm = `${modId}:view` as PermissionKey;
      if (!nextPerms.includes(viewPerm)) {
        nextPerms.push(viewPerm);
      }
      setTargetPermissions(nextPerms);
    } else {
      // If disabling 'view', also remove all other actions for this module
      if (permKey === `${modId}:view`) {
        setTargetPermissions(
          targetPermissions.filter((p) => !p.startsWith(`${modId}:`))
        );
        setTargetModules(targetModules.filter((m) => m !== modId));
      } else {
        setTargetPermissions(targetPermissions.filter((p) => p !== permKey));
      }
    }
  };

  // Submit invite
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName || invitePassword.length < 8) return;

    try {
      setActionLoading(true);
      setActionFeedback(null);
      const res = await adminUsersApi.inviteEmployee({
        email: inviteEmail,
        fullName: inviteName,
        password: invitePassword,
        role: inviteRole,
        accessibleModules: inviteModules,
        permissions: invitePermissions,
      });

      setEmployees((prev) => [res.data, ...prev]);
      setIsInviteOpen(false);
      // Reset form
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      setInviteRole('editor');
      setInviteModules(['blogs']);
      setInvitePermissions(['blogs:view', 'blogs:create', 'blogs:edit']);
      setActionFeedback({
        type: 'success',
        message: `Employee ${res.data.fullName} invited successfully.`,
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to invite employee',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit permission edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      setActionLoading(true);
      setActionFeedback(null);
      const res = await adminUsersApi.updatePermissions(editingEmployee.id, {
        role: editingEmployee.role as EmployeeRole,
        accessibleModules: editingEmployee.accessibleModules,
        permissions: editingEmployee.permissions,
      });

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingEmployee.id ? res.data : emp))
      );
      setEditingEmployee(null);
      initialEditSnapshot.current = '';
      setActionFeedback({
        type: 'success',
        message: `Permissions updated for ${res.data.fullName}`,
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to update permissions',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit status toggle (activate / suspend)
  const handleStatusToggleConfirm = async () => {
    if (!statusToggleTarget) return;

    try {
      setActionLoading(true);
      const nextStatus =
        statusToggleTarget.status === 'active' ? 'suspended' : 'active';
      const res = await adminUsersApi.toggleStatus(
        statusToggleTarget.id,
        nextStatus
      );

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === statusToggleTarget.id ? res.data : emp))
      );
      setStatusToggleTarget(null);
      setActionFeedback({
        type: 'success',
        message: `Account for ${res.data.fullName} is now ${nextStatus}.`,
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to toggle account status',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manage Roles & Access
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00477f]/10 text-[#00477f]">
              <ShieldCheck size={13} className="text-[#d06549]" /> Main Admin Control
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage team members, assign module access, and configure granular action permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadEmployees}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition shadow-sm"
            title="Refresh employee list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00477f] text-white hover:bg-[#003865] text-sm font-medium shadow-sm transition"
          >
            <UserPlus size={16} />
            <span>Add / Invite Employee</span>
          </button>
        </div>
      </div>

      {/* Dev Mock Preview Banner */}
      {isMockPreview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-0.5">
            <p className="font-semibold">Development Mock Data Preview Active</p>
            <p className="text-amber-700">
              Backend RBAC endpoints (<code>/api/admin/users</code>) are pending backend deployment.
              Showing safe, in-memory preview state. Mock changes will NOT be saved to the database.
            </p>
          </div>
        </div>
      )}

      {/* Action feedback toast */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center justify-between text-sm ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <XCircle size={16} className="text-rose-600" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00477f]/20 focus:border-[#00477f]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Filter size={14} /> Filters:
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#00477f]"
          >
            <option value="all">All Roles</option>
            <option value="main_admin">Main Admin</option>
            <option value="editor">Editor</option>
            <option value="publisher">Publisher</option>
            <option value="viewer">Viewer / Inspector</option>
            <option value="custom">Custom Role</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#00477f]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00477f] mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading team members…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle size={32} className="text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-gray-800">{error}</p>
            <button
              onClick={loadEmployees}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#00477f] text-white hover:bg-[#003865]"
            >
              Retry
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users size={32} className="text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-700">No employees match your search or filter</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or invite a new employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Assigned Modules</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => {
                  const isProtectedAdmin = emp.isProtected || emp.isMainAdmin;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-[#00477f] font-semibold flex items-center justify-center text-xs flex-shrink-0">
                            {emp.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-gray-900">
                              <span>{emp.fullName}</span>
                              {isProtectedAdmin && (
                                <span
                                  title="Protected Main Admin account (cannot be demoted or deactivated)"
                                  className="inline-flex text-[#00477f]"
                                >
                                  <Lock size={13} className="text-amber-600" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={11} className="text-gray-400" />
                              <span>{emp.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {emp.role === 'main_admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#00477f]/10 text-[#00477f]">
                            <ShieldCheck size={12} className="text-[#d06549]" /> Main Admin
                          </span>
                        ) : emp.role === 'publisher' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Publisher
                          </span>
                        ) : emp.role === 'editor' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Editor
                          </span>
                        ) : emp.role === 'viewer' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            Viewer / Inspector
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Custom Role
                          </span>
                        )}
                      </td>

                      {/* Assigned Modules */}
                      <td className="px-6 py-4">
                        {emp.isMainAdmin ? (
                          <span className="text-xs font-semibold text-[#00477f] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            ★ All Modules (Full Access)
                          </span>
                        ) : emp.accessibleModules.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {emp.accessibleModules.map((mod) => (
                              <span
                                key={mod}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200"
                              >
                                {MODULE_LABELS[mod] || mod}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No modules assigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {emp.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(emp)}
                            disabled={isProtectedAdmin}
                            title={
                              isProtectedAdmin
                                ? 'Protected Main Admin account cannot have permissions altered'
                                : 'Edit employee modules & permissions'
                            }
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition ${
                              isProtectedAdmin
                                ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                : 'text-[#00477f] hover:bg-[#00477f]/10 border border-[#00477f]/20'
                            }`}
                          >
                            <Edit2 size={13} />
                            <span>Edit Permissions</span>
                          </button>

                          <button
                            onClick={() => setStatusToggleTarget(emp)}
                            disabled={isProtectedAdmin}
                            title={
                              isProtectedAdmin
                                ? 'Protected Main Admin cannot be suspended'
                                : emp.status === 'active'
                                ? 'Suspend employee account'
                                : 'Reactivate employee account'
                            }
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                              isProtectedAdmin
                                ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                : emp.status === 'active'
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {emp.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: Invite / Add Employee ── */}
      {isInviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleRequestCloseInvite();
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-[#00477f]" />
                <h2 className="text-lg font-bold text-gray-900">Add / Invite New Employee</h2>
              </div>
              <button
                type="button"
                onClick={handleRequestCloseInvite}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00477f]/20 focus:border-[#00477f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@plumtrips.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00477f]/20 focus:border-[#00477f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00477f]/20 focus:border-[#00477f]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  8 to 72 characters. The password is securely hashed before storage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role Template (Initializes Permissions)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleInviteRoleChange(e.target.value as EmployeeRole)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#00477f]"
                >
                  <option value="editor">Editor (View + Create + Edit across selected modules)</option>
                  <option value="publisher">Publisher (View + Publish where applicable, no Create/Edit)</option>
                  <option value="viewer">Viewer / Inspector (Read-only access)</option>
                  <option value="custom">Custom Role (Manual fine-grained configuration)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Selecting a template sets default module capabilities. You can still customize individual action buttons below.
                </p>
              </div>

              {/* Module & Action Permissions Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Module & Action Permissions
                  </label>
                  <span className="text-[11px] text-gray-500">
                    *Image upload is granted automatically with Create or Edit
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {MANAGEABLE_MODULES.map((mod) => {
                    const isModuleChecked = inviteModules.includes(mod.id);
                    return (
                      <div key={mod.id} className="p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isModuleChecked}
                              onChange={() =>
                                handleToggleModule(
                                  mod.id,
                                  inviteRole,
                                  inviteModules,
                                  setInviteModules,
                                  invitePermissions,
                                  setInvitePermissions
                                )
                              }
                              className="w-4 h-4 text-[#00477f] rounded border-gray-300 focus:ring-[#00477f]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{mod.label}</p>
                              <p className="text-xs text-gray-400">{mod.description}</p>
                            </div>
                          </label>
                        </div>

                        {/* Action buttons */}
                        {isModuleChecked && (
                          <div className="flex flex-wrap gap-2 pl-6">
                            {mod.actions.map((act) => {
                              const permKey = `${mod.id}:${act.key}` as PermissionKey;
                              const isActionActive = invitePermissions.includes(permKey);
                              return (
                                <button
                                  type="button"
                                  key={act.key}
                                  onClick={() =>
                                    handleToggleActionPermission(
                                      permKey,
                                      mod.id,
                                      inviteModules,
                                      setInviteModules,
                                      invitePermissions,
                                      setInvitePermissions
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                                    isActionActive
                                      ? 'bg-[#00477f] text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isActionActive && <Check size={11} />}
                                  <span>{act.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleRequestCloseInvite}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#00477f] hover:bg-[#003865] rounded-lg transition shadow-sm"
                >
                  {actionLoading ? 'Inviting…' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Edit Permissions Modal ── */}
      {editingEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleRequestCloseEdit();
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Configure Permissions: {editingEmployee.fullName}
                </h2>
                <p className="text-xs text-gray-500">{editingEmployee.email}</p>
              </div>
              <button
                type="button"
                onClick={handleRequestCloseEdit}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role Template (Initializes Permissions)
                </label>
                <select
                  value={editingEmployee.role}
                  onChange={(e) => handleEditRoleChange(e.target.value as EmployeeRole)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#00477f]"
                >
                  <option value="editor">Editor (View + Create + Edit across selected modules)</option>
                  <option value="publisher">Publisher (View + Publish where applicable, no Create/Edit)</option>
                  <option value="viewer">Viewer / Inspector (Read-only access)</option>
                  <option value="custom">Custom Role (Manual fine-grained configuration)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Selecting a template sets default module capabilities. You can still customize individual action buttons below.
                </p>
              </div>

              {/* Module & Action Permissions Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Module & Action Permissions
                  </label>
                  <span className="text-[11px] text-gray-500">
                    *Image upload is allowed automatically during Create or Edit
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {MANAGEABLE_MODULES.map((mod) => {
                    const isModuleChecked = editingEmployee.accessibleModules.includes(mod.id);
                    return (
                      <div key={mod.id} className="p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isModuleChecked}
                              onChange={() =>
                                handleToggleModule(
                                  mod.id,
                                  editingEmployee.role as EmployeeRole,
                                  editingEmployee.accessibleModules,
                                  (nextMods) =>
                                    setEditingEmployee({
                                      ...editingEmployee,
                                      accessibleModules: nextMods,
                                    }),
                                  editingEmployee.permissions,
                                  (nextPerms) =>
                                    setEditingEmployee({
                                      ...editingEmployee,
                                      permissions: nextPerms,
                                    })
                                )
                              }
                              className="w-4 h-4 text-[#00477f] rounded border-gray-300 focus:ring-[#00477f]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{mod.label}</p>
                              <p className="text-xs text-gray-400">{mod.description}</p>
                            </div>
                          </label>
                        </div>

                        {/* Action buttons */}
                        {isModuleChecked && (
                          <div className="flex flex-wrap gap-2 pl-6">
                            {mod.actions.map((act) => {
                              const permKey = `${mod.id}:${act.key}` as PermissionKey;
                              const isActionActive = editingEmployee.permissions.includes(permKey);
                              return (
                                <button
                                  type="button"
                                  key={act.key}
                                  onClick={() =>
                                    handleToggleActionPermission(
                                      permKey,
                                      mod.id,
                                      editingEmployee.accessibleModules,
                                      (nextMods) =>
                                        setEditingEmployee({
                                          ...editingEmployee,
                                          accessibleModules: nextMods,
                                        }),
                                      editingEmployee.permissions,
                                      (nextPerms) =>
                                        setEditingEmployee({
                                          ...editingEmployee,
                                          permissions: nextPerms,
                                        })
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                                    isActionActive
                                      ? 'bg-[#00477f] text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isActionActive && <Check size={11} />}
                                  <span>{act.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleRequestCloseEdit}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#00477f] hover:bg-[#003865] rounded-lg transition shadow-sm"
                >
                  {actionLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Confirm Account Status Toggle ── */}
      {statusToggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Account {statusToggleTarget.status === 'active' ? 'Suspension' : 'Activation'}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to{' '}
              <strong className="text-gray-900">
                {statusToggleTarget.status === 'active' ? 'suspend' : 'activate'}
              </strong>{' '}
              access for <span className="font-semibold">{statusToggleTarget.fullName}</span> (
              {statusToggleTarget.email})?
              {statusToggleTarget.status === 'active'
                ? ' This operator will immediately lose access to all marketing modules upon session refresh.'
                : ' This operator will regain access to their assigned modules.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusToggleTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusToggleConfirm}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-sm ${
                  statusToggleTarget.status === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading
                  ? 'Updating…'
                  : statusToggleTarget.status === 'active'
                  ? 'Yes, Suspend Account'
                  : 'Yes, Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Confirm Discard Unsaved Changes ── */}
      {pendingDiscardAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-amber-600 mb-2.5">
              <AlertTriangle size={22} />
              <h3 className="text-base font-bold text-gray-900">Discard Unsaved Changes?</h3>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              You have unsaved changes that will be lost if you leave. Are you sure you want to discard them?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDiscardAction(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = pendingDiscardAction;
                  setPendingDiscardAction(null);
                  if (action) action();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}