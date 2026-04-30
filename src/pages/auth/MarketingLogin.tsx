import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MarketingLogin() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/marketing-dash');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* page */
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel – Navy brand ── */}
      <div
        className="relative flex lg:w-1/2 hero-gradient overflow-hidden"
        style={{ background: '#00477f' }}
      >
        <div className="relative z-10 flex flex-col justify-between w-full px-10 py-12 lg:px-16 lg:py-16">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <img
                src="/assets/logo.png"
                alt="Plumtrips"
                className="h-12 w-auto object-contain"
              />
            <div>
              <div className="text-white font-bold text-lg leading-none flash-font">Plumtrips</div>
              <div className="text-white/60 text-xs mt-0.5 tracking-wide uppercase">Marketing Panel</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-auto mb-10 lg:mb-0">
            <h2 className="text-white text-3xl lg:text-4xl font-bold leading-tight flash-font mb-4">
              Craft stories that<br />move the world.
            </h2>
            <p className="text-white/65 text-base leading-relaxed max-w-sm">
              Your full-stack CMS for exotic travel content — from draft to published in minutes.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3">
              {[
                'Rich TSX blog editor',
                'AWS S3 image uploads',
                'Draft · Schedule · Publish',
                'SEO & slug management',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#d06549' }}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decorative circles */}
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: '#d06549' }}
        />
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.07]"
          style={{ background: '#ffffff' }}
        />
      </div>

      {/* ── Right panel – Login form ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 lg:px-16">
        <form
          className="w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flash-font">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1">Access the Plumtrips Marketing Panel</p>
          </div>

          {/* Email field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m2 7 10 7 10-7"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="admin@plumtrips.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#00477f' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#00477f' } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: loading ? '#00477f99' : '#00477f' }}
            onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#003a6b')}
            onMouseLeave={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#00477f')}
          >
            {loading
              ? (
                <svg
                  className="animate-spin w-4 h-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )
              : 'Sign in to Dashboard'
            }
          </button>
        </form>
      </div>
    </div>
  );
}