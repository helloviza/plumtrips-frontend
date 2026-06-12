import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MarketingLogin() {
  const { marketlogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      await marketlogin(email, password);
      toast.success('Welcome back!');
      navigate('/marketing-dash');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    // Left panel – midnight navy (matches the target PNG right panel)
    rightPanelBg: '#0b1528',
    // Slightly lighter navy for depth
    rightPanelSurface: '#111e35',
    onSurface: '#e1e3e4',
    onSurfaceVariant: '#8a9bb5',
    outline: '#a48b85',
    outlineVariant: '#56423d',
    primary: '#df7154',       // sunset orange
    onPrimary: '#ffffff',
    // Input box fill – white filled boxes as in the target PNG
    inputBg: '#ffffff',
    inputBgFocus: '#ffffff',
    inputBorder: 'rgba(255,255,255,0.9)',
    inputBorderFocus: '#df7154',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: colors.onSurface,
    display: 'block',
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    // Filled box style matching the target PNG
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '4px',
    color: '#1a1a1a',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    padding: '12px 14px',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box' as const,
  };

  // Monaco nighttime harbor – matches the zip's screen.png exactly
  const heroImage = '/assets/marketing-hero.jpg';
  const fallbackImage = 'https://images.openai.com/static-rsc-4/uCS59ISOlOLRDM1PMUS773kjKyZwYf5cKygCxnetFJVY4eI7OJS1ljua9JY2dloLYlVDHD3lskKR65g6qhgOf09njbgWhcpsBs2q9YpiDrL2u89nq5zr2Pq0QI9-AhQhVw5C7pHg23mmSULPhgd_9SVqT_kILiwBQkIIr6ovE4XNLHJtRNqW6wmPFWr0wQPY?purpose=fullsize';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      // Hero image spans full viewport
      backgroundColor: '#0a1525',
      backgroundImage: `url(${heroImage}), url(${fallbackImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%',
      padding: '50px 180px',
      boxSizing: 'border-box',
    }}>

      {/* Full-viewport cinematic overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(5,12,28,0.92) 0%, rgba(5,12,28,0.45) 45%, rgba(5,12,28,0.15) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom-left text overlay */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        left: 80,
        zIndex: 10,
        maxWidth: '520px',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#ffffff',
          margin: '0 0 16px',
        }}>
          Premium Marketing Intelligence
        </p>
        <h2 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '64px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          margin: '0 0 20px',
        }}>
          Craft stories that<br />move the world
        </h2>
        <p style={{
          fontFamily: '"Source Serif 4", serif',
          fontSize: '18px',
          fontWeight: 400,
          lineHeight: 1.6,
          color: 'rgba(225,227,228,0.80)',
          margin: 0,
        }}>
          The all-in-one platform for luxury travel marketing and high-end editorial distribution.
        </p>
      </div>

      {/* ── Floating form card ── */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        background: colors.rightPanelBg,
        borderRadius: '12px',
        width: '490px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 44px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Heading */}
        <h1 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '32px',
          fontWeight: 700,
          lineHeight: 1.2,
          color: colors.onSurface,
          margin: '0 0 36px',
        }}>
          Access the Plumtrips<br />Marketing Panel
        </h1>

        {/* Email field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email ID</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
            onFocus={e => {
              e.currentTarget.style.borderColor = colors.inputBorderFocus;
              e.currentTarget.style.background = colors.inputBgFocus;
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = colors.inputBorder;
              e.currentTarget.style.background = colors.inputBg;
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <button type="button" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.primary,
              padding: 0,
            }}>
              Reset Password
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            style={inputStyle}
            onFocus={e => {
              e.currentTarget.style.borderColor = colors.inputBorderFocus;
              e.currentTarget.style.background = colors.inputBgFocus;
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = colors.inputBorder;
              e.currentTarget.style.background = colors.inputBg;
            }}
          />
        </div>

        {/* Remember me */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div
            onClick={() => setRememberMe(p => !p)}
            style={{
              width: '16px',
              height: '16px',
              border: `1px solid ${rememberMe ? colors.primary : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: rememberMe ? colors.primary : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {rememberMe && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: colors.onSurface, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setRememberMe(p => !p)}
          >
            Remember me
          </span>
        </div>

        {/* Submit button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? `${colors.primary}99` : colors.primary,
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.15s',
            boxShadow: loading ? 'none' : '0 0 20px rgba(223,113,84,0.25)',
            marginBottom: '16px',
          }}
          onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#c85e43')}
          onMouseLeave={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = colors.primary)}
        >
          {loading ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : 'Launch Panel'}
        </button>

        {/* Contact note */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          margin: '0 0 28px',
        }}>
          Don't have an account?{' '}
          <span style={{ color: colors.onSurface, fontWeight: 600, cursor: 'pointer' }}>
            Contact Partnership Management
          </span>
        </p>

        {/* Footer links */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
        }}>
          {['Privacy Policy', 'Terms of Service', 'Help'].map(link => (
            <span
              key={link}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                color: colors.onSurfaceVariant,
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = colors.onSurface)}
              onMouseLeave={e => (e.currentTarget.style.color = colors.onSurfaceVariant)}
            >
              {link}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}