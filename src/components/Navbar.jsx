import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/',         label: 'Home'     },
  { to: '/accounts', label: 'Accounts' },
  { to: '/stats',    label: 'Stats'    },
  { to: '/export',   label: 'Export'   },
  { to: '/about',    label: 'About'    },
  { to: '/profile',  label: 'Profile'  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = (user?.username?.[0] || 'A').toUpperCase();

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: 'var(--nav-h)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 12,
        boxShadow: '0 1px 0 var(--border), 0 4px 16px rgba(79,70,229,0.04)',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15, fontWeight: 800, color: 'white',
            boxShadow: '0 2px 10px rgba(79,70,229,0.35)',
          }}>A</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1 }}>APEX</div>
            <div style={{ fontSize: 9, color: 'var(--primary-light)', letterSpacing: 2, fontWeight: 600 }}>MANAGER</div>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              style={({ isActive }) => ({
                textDecoration: 'none', padding: '7px 16px', borderRadius: 8,
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text3)',
                background: isActive ? 'var(--primary-pale)' : 'transparent',
                transition: 'all 0.18s',
              })}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'var(--bg3)'; } }}
              onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* User */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px',
            background: 'var(--bg3)', borderRadius: 99, border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}>{initial}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{user?.username}</span>
          </div>
          <button onClick={handleLogout} style={{
            background: 'var(--red-bg)', border: '1.5px solid var(--red-b)',
            color: 'var(--red)', padding: '7px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-bg)'; }}
          >Sign Out</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} className="nav-mobile" style={{
          marginLeft: 'auto', background: 'var(--bg3)',
          border: '1px solid var(--border)', color: 'var(--text2)',
          width: 38, height: 38, borderRadius: 9, fontSize: 16,
          display: 'none', alignItems: 'center', justifyContent: 'center',
        }}>{open ? '✕' : '☰'}</button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="slide-down" style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 299,
          background: 'rgba(255,255,255,0.98)', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)', paddingBottom: 8,
        }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block', textDecoration: 'none',
                padding: '13px 24px', fontSize: 15, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text2)',
                background: isActive ? 'var(--primary-pale)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
              })}
            >{l.label}</NavLink>
          ))}
          <div style={{ padding: '10px 24px 4px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>@{user?.username}</span>
            <button onClick={handleLogout} className="btn-danger" style={{ padding: '7px 16px', fontSize: 13 }}>Sign Out</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .nav-desktop{display:none!important} .nav-mobile{display:flex!important} }
        @media (min-width: 769px) { .nav-mobile{display:none!important} }
      `}</style>
    </>
  );
}
