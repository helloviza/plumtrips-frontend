// src/components/auth/AccessDenied.tsx
import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedProps {
  moduleName?: string;
  requiredPermission?: string;
}

export default function AccessDenied({ moduleName, requiredPermission }: AccessDeniedProps) {
  const navigate = useNavigate();
  const { firstAccessiblePath, profile } = usePermission();
  const { logout: marketLogout } = useAuth();

  const handleReturn = () => {
    if (firstAccessiblePath) {
      navigate(firstAccessiblePath);
    } else {
      navigate('/marketing-login');
    }
  };

  const handleSignOut = async () => {
    try {
      await marketLogout();
    } finally {
      navigate('/marketing-login');
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
        <ShieldAlert size={40} strokeWidth={1.75} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Access Restricted
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-600 leading-relaxed">
        {moduleName ? (
          <>
            Your account does not currently have permission to access the{' '}
            <strong className="text-slate-900">{moduleName}</strong> module.
          </>
        ) : (
          'Your account does not currently have permissions assigned to access this section.'
        )}
      </p>

      {requiredPermission && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-600">
          <span>Required capability:</span>
          <span className="font-semibold text-slate-800">{requiredPermission}</span>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{profile?.email || 'operator'}</span>.
        If you need access, please contact your Main Admin (<strong>utkarsh@plumtrips.com</strong>).
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {firstAccessiblePath && (
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 rounded-lg bg-[#d06549] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c2593d] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Go to Accessible Module</span>
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}