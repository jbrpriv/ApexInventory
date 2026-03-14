import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/',         label: 'Home',     end: true  },
  { to: '/accounts', label: 'Accounts', end: false },
  { to: '/stats',    label: 'Stats',    end: false },
  { to: '/export',   label: 'Export',   end: false },
  { to: '/about',    label: 'About',    end: false },
  { to: '/profile',  label: 'Profile',  end: false },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = (user?.username?.[0] || 'A').toUpperCase();

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        height: 'var(--nav-h)',
        background: scrolled
          ? 'rgba(7,9,15,0.95)'
          : 'rgba(7,9,15,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 8,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.6)' : 'none',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8 }}>
          <div style={{ position: 'relative', width: 32, height: 32 }}>
            {/* Spinning ring */}
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,217,255,0.2)" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--neon)" strokeWidth="1.5"
                strokeDasharray="20 68" strokeLinecap="round"
                style={{ animation: 'logoSpin 4s linear infinite', transformOrigin: '16px 16px' }} />
            </svg>
            <div style={{
              position: 'absolute', inset: '5px',
              background: 'linear-gradient(135deg, var(--neon), var(--violet))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#000',
            }}>A</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: 2, lineHeight: 1 }}>APEX</div>
            <div style={{ fontSize: 7.5, color: 'var(--neon)', letterSpacing: 3, fontWeight: 600, opacity: 0.7 }}>MANAGER</div>
          </div>
        </NavLink>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: 'var(--border-md)', marginRight: 4 }} />

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: 'flex', gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* User */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px',
            background: 'rgba(255,255,255,0.04)', borderRadius: 99,
            border: '1px solid var(--border-md)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--neon), var(--violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#000', fontFamily: 'var(--font-display)',
            }}>{initial}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>{user?.username}</span>
          </div>
          <button onClick={handleLogout} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase',
            background: 'transparent', border: '1px solid rgba(255,51,85,0.4)',
            color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,51,85,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
          >Out</button>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(o => !o)} className="nav-mobile-btn" style={{
          marginLeft: 'auto', background: open ? 'var(--neon-dim)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'var(--neon)' : 'var(--border-md)'}`,
          color: open ? 'var(--neon)' : 'var(--text2)',
          width: 36, height: 36, borderRadius: 8,
          display: 'none', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', fontSize: 16,
        }}>{open ? '✕' : '☰'}</button>
      </nav>

      {/* Neon underline */}
      <div style={{
        position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 499,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--neon), transparent)',
        opacity: scrolled ? 0.4 : 0.1,
        transition: 'opacity 0.3s',
      }} />

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 498,
          background: 'rgba(7,9,15,0.98)', borderBottom: '1px solid var(--border-md)',
          backdropFilter: 'blur(20px)', paddingBottom: 12,
          animation: 'fadeUp 0.2s ease both',
        }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-mobile-link${isActive ? ' nav-mobile-link-active' : ''}`}
            >{l.label}</NavLink>
          ))}
          <div style={{ margin: '10px 24px 0', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>@{user?.username}</span>
            <button onClick={handleLogout} style={{
              padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-display)', letterSpacing: 1,
              background: 'var(--danger-dim)', border: '1px solid rgba(255,51,85,0.4)',
              color: 'var(--danger)', cursor: 'pointer',
            }}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  );
}
