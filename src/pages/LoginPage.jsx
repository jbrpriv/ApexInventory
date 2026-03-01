import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authLogin, getBackground } from '../api';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [bgUrl, setBgUrl] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { getBackground().then(r => setBgUrl(r.data.url || '')).catch(() => {}); }, []);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username || !form.password) return setError('Please fill in all fields');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: bgUrl
        ? `url(${bgUrl}) center/cover no-repeat`
        : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 65%, #1e1b4b 100%)',
      position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,30,0.62)' }} />
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      {/* Left side branding panel */}
      <div className="login-left" style={{
        position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px',
      }}>
        {/* Logo mark */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(79,70,229,0.5)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 20, fontWeight: 800, color: 'white',
          }}>A</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1 }}>APEX</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, fontWeight: 600 }}>MANAGER</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#818cf8', letterSpacing: 4, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>
          Account Inventory
        </div>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800,
          color: 'white', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 20,
        }}>
          Manage your<br />
          <span style={{ background: 'linear-gradient(90deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Apex accounts
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
          Track status, manage credentials and monitor your inventory — all in one place.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 10, marginTop: 40, flexWrap: 'wrap' }}>
          {['Account Tracking', 'Sales Management', 'Stats & Analytics'].map(f => (
            <span key={f} style={{
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(79,70,229,0.25)', border: '1px solid rgba(129,140,248,0.35)',
              color: '#a5b4fc', fontSize: 12, fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Right side login form */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 40px',
        width: '100%', maxWidth: 460,
        flexShrink: 0,
      }}>
        <div className="scale-in" style={{
          background: 'white', borderRadius: 24, padding: '36px 32px',
          width: '100%', maxWidth: 400,
          boxShadow: '0 32px 96px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
        }}>
          {/* Form header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 22, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.4px', marginBottom: 6,
            }}>Welcome back</h2>
            <p style={{ color: '#64748b', fontSize: 13.5 }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <input
                  type="text" value={form.username} onChange={set('username')}
                  placeholder="Your username" autoFocus autoComplete="username"
                  style={{
                    width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    color: '#0f172a', borderRadius: 10, fontFamily: 'inherit',
                    fontSize: 14, outline: 'none', transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Your password" autoComplete="current-password"
                  style={{
                    width: '100%', paddingLeft: 38, paddingRight: 44, paddingTop: 12, paddingBottom: 12,
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    color: '#0f172a', borderRadius: 10, fontFamily: 'inherit',
                    fontSize: 14, outline: 'none', transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                  padding: 4, display: 'flex', alignItems: 'center',
                }}>
                  {showPw
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1.5px solid #fca5a5',
                color: '#dc2626', padding: '10px 14px', borderRadius: 9,
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px', borderRadius: 10, fontSize: 14.5, fontWeight: 700,
              background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: 'none', color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(79,70,229,0.4)',
              transition: 'all 0.18s', letterSpacing: 0.2,
            }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: 12 }}>
            Apex Legends Account Manager
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#1e1b4b; }
        @media (max-width: 700px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
