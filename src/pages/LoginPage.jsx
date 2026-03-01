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

  useEffect(() => {
    getBackground().then(r => setBgUrl(r.data.url || '')).catch(() => {});
  }, []);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username || !form.password) return setError('Please fill in all fields');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9',
    padding: '12px 16px', borderRadius: 10, fontFamily: 'inherit',
    fontSize: 15, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #07071a 0%, #12063a 50%, #07071a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif", position: 'relative', padding: 20,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />

      {/* Grid decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="fade-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(139,92,246,0.5)',
            fontSize: 24, fontWeight: 900, color: '#fff',
            fontFamily: "'Syne', sans-serif",
          }}>A</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>APEX MANAGER</div>
          <div style={{ color: '#8b5cf6', fontSize: 11, letterSpacing: 4, marginTop: 4, opacity: 0.9 }}>ACCOUNT INVENTORY SYSTEM</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(12,12,34,0.92)', border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 16, padding: '28px 28px 24px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.05)',
        }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 22, fontWeight: 500 }}>
            Sign in to continue
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Username</label>
              <input
                type="text" value={form.username} onChange={set('username')}
                placeholder="Enter username" autoFocus autoComplete="username"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Enter password" autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16,
                }}>{showPw ? '◔' : '◑'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                color: '#f43f5e', padding: '10px 14px', borderRadius: 8, fontSize: 13,
              }}>⚠ {error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px',
              background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontSize: 15, fontWeight: 700, letterSpacing: 0.5,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(139,92,246,0.4)',
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#334155', fontSize: 12 }}>
          Apex Legends Account Manager
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07071a; }
      `}</style>
    </div>
  );
}
