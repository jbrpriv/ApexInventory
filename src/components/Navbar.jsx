import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',         label: 'Home',     icon: '⬡' },
  { to: '/accounts', label: 'Accounts', icon: '◈' },
  { to: '/stats',    label: 'Stats',    icon: '◎' },
  { to: '/export',   label: 'Export',   icon: '↓' },
  { to: '/about',    label: 'About',    icon: '◉' },
  { to: '/profile',  label: 'Profile',  icon: '◔' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.username?.[0] || 'A').toUpperCase();

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 'var(--nav-h)',
        background: 'rgba(7,7,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16,
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 0 16px rgba(139,92,246,0.4)',
          }}>A</div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800,
            letterSpacing: 1, color: 'var(--text)',
          }}>APEX</span>
          <span style={{ fontSize: 11, color: 'var(--primary-light)', letterSpacing: 2, opacity: 0.8 }}>MGR</span>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              style={({ isActive }) => ({
                textDecoration: 'none',
                padding: '6px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, letterSpacing: 0.3,
                color: isActive ? 'var(--primary-light)' : 'var(--text2)',
                background: isActive ? 'var(--primary-dim)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                transition: 'all 0.18s',
              })}
            >{link.label}</NavLink>
          ))}
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }} className="desktop-nav">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px 5px 5px', borderRadius: 20,
            background: 'var(--card)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{user?.username}</span>
          </div>
          <button onClick={handleLogout} style={{
            background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)',
            color: 'var(--red)', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, transition: 'all 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red-dim)'}
          >Sign Out</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(o => !o)}
          className="hamburger"
          style={{
            marginLeft: 'auto', background: 'var(--card)',
            border: '1px solid var(--border)', color: 'var(--primary-light)',
            width: 36, height: 36, borderRadius: 8, fontSize: 16,
            display: 'none', alignItems: 'center', justifyContent: 'center',
          }}
        >{mobileOpen ? '✕' : '☰'}</button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-drawer slide-down" style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 199,
          background: 'rgba(7,7,26,0.98)', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', fontSize: 15, fontWeight: 500,
                color: isActive ? 'var(--primary-light)' : 'var(--text2)',
                background: isActive ? 'var(--primary-dim)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              })}
            >
              <span style={{ opacity: 0.7 }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>@{user?.username}</span>
            <button onClick={handleLogout} style={{
              background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)',
              color: 'var(--red)', padding: '7px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
            }}>Sign Out</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
