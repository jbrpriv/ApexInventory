import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authChangePassword, uploadBackground, resetBackground, getBackground } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPws, setShowPws] = useState({});
  const [bgUrl, setBgUrl] = useState('');
  const [bgUploading, setBgUploading] = useState(false);
  const fileRef = useRef();

  // Load current background on mount
  React.useEffect(() => {
    getBackground().then(r => setBgUrl(r.data.url || '')).catch(() => {});
  }, []);

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
    } finally { setPwLoading(false); }
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return toast.error('Only JPG, PNG or WEBP allowed');
    setBgUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await uploadBackground(fd);
      toast.success('Background updated!');
      setBgUrl(res.data.url);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setBgUploading(false); }
  };

  const handleBgReset = async () => {
    try { await resetBackground(); setBgUrl(''); toast.success('Background reset to default'); }
    catch { toast.error('Reset failed'); }
  };

  const iStyle = {
    background: 'var(--bg)', border: '1.5px solid var(--border-md)', color: 'var(--text)',
    padding: '10px 14px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
    outline: 'none', width: '100%', transition: 'border-color 0.2s, box-shadow 0.18s',
  };

  const sectionStyle = {
    background: 'white', border: '1px solid var(--border)',
    borderRadius: 14, padding: '22px 24px', marginBottom: 16,
    boxShadow: 'var(--sh-sm)',
  };

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Account</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Profile</h1>
      </div>

      {/* User info */}
      <div style={{ ...sectionStyle, borderTop: '3px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: '0 0 20px rgba(79,70,229,0.3)',
          }}>{(user?.username?.[0] || 'A').toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{user?.username || 'Admin'}</div>
            <div style={{ fontSize: 11, color: 'var(--primary)', letterSpacing: 2, marginTop: 2, fontWeight: 600, textTransform: 'uppercase' }}>Administrator</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Change Password</div>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password' },
            { key: 'confirm',         label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, fontWeight: 600 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPws[f.key] ? 'text' : 'password'}
                  value={pwForm[f.key]} onChange={setPw(f.key)}
                  placeholder="••••••••"
                  style={{ ...iStyle, paddingRight: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPws(p => ({ ...p, [f.key]: !p[f.key] }))} style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 4,
                }}>
                  {showPws[f.key]
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwLoading} style={{
            marginTop: 4, padding: '12px',
            background: pwLoading ? 'var(--border-md)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            border: 'none', color: '#fff', borderRadius: 9,
            fontSize: 14, fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer',
            opacity: pwLoading ? 0.7 : 1, fontFamily: 'inherit',
            boxShadow: pwLoading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
          }}>
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Dashboard Background */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Dashboard Background</div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 18, lineHeight: 1.5 }}>
          Customize the hero background image displayed on the home page.
        </p>

        {/* Preview */}
        {bgUrl && (
          <div style={{ borderRadius: 10, overflow: 'hidden', height: 120, marginBottom: 16, position: 'relative' }}>
            <img src={bgUrl} alt="Current background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)', display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
              <span style={{ fontSize: 11, color: 'white', fontWeight: 600, background: 'rgba(0,0,0,0.4)', padding: '3px 10px', borderRadius: 99 }}>Current Background</span>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBgUpload} style={{ display: 'none' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => fileRef.current.click()}
            disabled={bgUploading}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 9,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              border: 'none', color: 'white', fontSize: 13.5, fontWeight: 700,
              cursor: bgUploading ? 'not-allowed' : 'pointer',
              opacity: bgUploading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!bgUploading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {bgUploading ? 'Uploading…' : bgUrl ? 'Change Background' : 'Add Background'}
          </button>

          {bgUrl && (
            <button
              onClick={handleBgReset}
              style={{
                padding: '12px 16px', borderRadius: 9,
                background: 'var(--red-bg)', border: '1.5px solid var(--red-b)',
                color: 'var(--red)', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-bg)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Reset
            </button>
          )}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text4)', marginTop: 10 }}>JPG, PNG, WEBP · Max 10MB</p>
      </div>

      {/* Danger Zone */}
      <div style={{ ...sectionStyle, borderTop: '3px solid var(--red)', marginBottom: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--red)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Danger Zone</div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '12px',
          background: 'var(--red-bg)', border: '1.5px solid var(--red-b)',
          color: 'var(--red)', borderRadius: 9, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red-bg)'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
