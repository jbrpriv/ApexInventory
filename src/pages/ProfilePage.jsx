import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authChangePassword } from '../api';
import BackgroundUpload from '../components/BackgroundUpload';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bgUrl, setBgUrl] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPws, setShowPws] = useState({});

  const handleLogout = () => { logout(); navigate('/login'); };

  const setPw = (k) => (e) => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Fill in all fields');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await authChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const iStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)',
    padding: '10px 14px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
    outline: 'none', width: '100%', transition: 'border-color 0.2s',
  };

  const sectionStyle = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '20px 22px', marginBottom: 16,
  };

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary-light)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Account</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Profile</h1>
      </div>

      {/* User info */}
      <div style={{ ...sectionStyle, borderTop: '2px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 0 20px rgba(139,92,246,0.3)',
          }}>
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{user?.username || 'Admin'}</div>
            <div style={{ fontSize: 12, color: 'var(--primary-light)', letterSpacing: 2, marginTop: 2 }}>ADMINISTRATOR</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Change Password</div>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPws[f.key] ? 'text' : 'password'}
                  value={pwForm[f.key]} onChange={setPw(f.key)}
                  placeholder="••••••••"
                  style={{ ...iStyle, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPws(p => ({ ...p, [f.key]: !p[f.key] }))} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14,
                }}>{showPws[f.key] ? '◔' : '◑'}</button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwLoading} style={{
            marginTop: 4, padding: '11px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            border: 'none', color: '#fff', borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer',
            opacity: pwLoading ? 0.7 : 1, fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
          }}>
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Background */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Dashboard Background</div>
        <BackgroundUpload currentUrl={bgUrl} onUpdate={setBgUrl} />
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Change the hero background image on the home page.</div>
      </div>

      {/* Danger zone */}
      <div style={{ ...sectionStyle, borderTop: '2px solid var(--red)' }}>
        <div style={{ fontSize: 11, color: 'var(--red)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Danger Zone</div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '11px',
          background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.3)',
          color: 'var(--red)', borderRadius: 8, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red-dim)'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
