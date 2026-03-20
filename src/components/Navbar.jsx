import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NavIcon = ({ name, size = 22 }) => {
  const paths = {
    home: (<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>),
    accounts: (<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>),
    stats: (<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>),
    export: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>),
    profile: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
    about: (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const BOTTOM_TABS = [
  { to: '/',         label: 'Home',     icon: 'home',     end: true  },
  { to: '/accounts', label: 'Accounts', icon: 'accounts', end: false },
  { to: '/stats',    label: 'Stats',    icon: 'stats',    end: false },
  { to: '/export',   label: 'Export',   icon: 'export',   end: false },
  { to: '/profile',  label: 'Profile',  icon: 'profile',  end: false },
];

const ALL_LINKS = [
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const initial = (user?.username?.[0] || 'A').toUpperCase();

  return (
    <>
      {/* ── DESKTOP top nav ─────────────────────────────────────── */}
      <nav className="top-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        height: 'var(--nav-h)',
        background: scrolled
          ? 'rgba(250,247,244,0.96)'
          : 'rgba(250,247,244,0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'}`,
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 8,
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.25s',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'white',
            boxShadow: '0 2px 12px rgba(234,88,12,0.45)',
          }}>A</div>
          <div>
            {/* FIX: was 'white' — now dark so it reads on the cream navbar background */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px', lineHeight: 1 }}>Apex</div>
            <div style={{ fontSize: 8.5, color: '#ea580c', letterSpacing: 2, fontWeight: 600 }}>MANAGER</div>
          </div>
        </NavLink>

        <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.1)', marginRight: 4 }} />

        {/* Links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {ALL_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 14px 5px 6px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 99, border: '1px solid rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
            }}>{initial}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#44403C' }}>{user?.username}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
              background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
              color: '#e11d48', cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.12)'; }}
          >Sign Out</button>
        </div>

        <button onClick={() => setOpen(o => !o)} className="nav-mobile-btn"
          style={{
            marginLeft: 'auto',
            background: open ? 'var(--primary-pale)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${open ? 'var(--primary)' : 'rgba(0,0,0,0.1)'}`,
            color: open ? 'var(--primary)' : 'var(--text2)',
            width: 36, height: 36, borderRadius: 8,
            display: 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s', fontSize: 16,
          }}>
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── MOBILE bottom tab bar ────────────────────────────────── */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
        background: 'rgba(250,247,244,0.97)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderTop: '0.5px solid rgba(0,0,0,0.1)',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 20px rgba(0,0,0,0.08)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}>
        <style>{`.bottom-nav-inner{display:flex;width:100%;align-items:stretch;}`}</style>
        <div className="bottom-nav-inner">
          {BOTTOM_TABS.map(tab => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className="bottom-tab" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="tab-pill"
                      style={{
                        position: 'absolute', top: 7, left: '50%', x: '-50%',
                        width: 40, height: 34, borderRadius: 10,
                        background: 'rgba(234,88,12,0.15)', zIndex: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.div className="bottom-tab-icon"
                    animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0, color: isActive ? '#ea580c' : 'rgba(28,25,23,0.35)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    style={{ color: isActive ? '#ea580c' : 'rgba(28,25,23,0.35)', position: 'relative', zIndex: 1 }}
                  >
                    <NavIcon name={tab.icon} size={21} />
                  </motion.div>
                  <span className="bottom-tab-label"
                    style={{ color: isActive ? '#ea580c' : 'rgba(28,25,23,0.35)', fontWeight: isActive ? 600 : 500 }}
                  >{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}