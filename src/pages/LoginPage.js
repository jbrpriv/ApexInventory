import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgUrl, setBgUrl] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/settings/background')
      .then(res => setBgUrl(res.data.url || ''))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      login(res.data.token, res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0a0a0f 0%, #0d1a2e 50%, #0a0a0f 100%)',
      fontFamily: "'Rajdhani', 'Exo 2', sans-serif", position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ color: '#00e5a0', fontSize: 36, fontWeight: 900, letterSpacing: 4 }}>⬡ APEX</div>
          <div style={{ color: '#4d9fff', fontSize: 11, letterSpacing: 6, marginTop: 4, opacity: 0.8 }}>INVENTORY SYSTEM</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(0,229,160,0.2)',
          borderRadius: 12, padding: 32, backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,160,0.05)'
        }}>
          <div style={{ color: '#a0aec0', fontSize: 12, letterSpacing: 3, marginBottom: 24, textTransform: 'uppercase' }}>
            Sign In to Continue
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: '#718096', fontSize: 11, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username" autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,229,160,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#718096', fontSize: 11, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,229,160,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 16
                }}>
                  {showPass ? '◔' : '◑'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                color: '#ff4d6d', padding: '8px 12px', borderRadius: 6, fontSize: 13
              }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              marginTop: 8, background: loading ? 'rgba(0,229,160,0.3)' : 'rgba(0,229,160,0.15)',
              border: '1px solid rgba(0,229,160,0.4)', color: '#00e5a0',
              padding: '12px', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', transition: 'all 0.2s'
            }}
              onMouseEnter={e => !loading && (e.target.style.background = 'rgba(0,229,160,0.25)')}
              onMouseLeave={e => !loading && (e.target.style.background = 'rgba(0,229,160,0.15)')}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&family=Exo+2:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0',
  padding: '10px 14px', borderRadius: 6, fontFamily: "'Rajdhani', sans-serif",
  fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
};