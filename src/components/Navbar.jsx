import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
          ? 'var(--nav-bg)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 8,
        boxShadow: scrolled ? '0 4px 30px var(--border)' : 'none',
        transition: 'all 0.25s',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--bg)',
            boxShadow: 'var(--sh-xs)',
          }}>A</div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1 }}>Apex</div>
            <div style={{ fontSize: 9, color: 'var(--text4)', letterSpacing: 1.5, fontWeight: 600 }}>MANAGER</div>
          </div>
        </NavLink>

        <div style={{ width: 1, height: 16, background: 'var(--border)', marginRight: 4 }} />

        {/* Links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {ALL_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* Actions (Avatar Pill + Theme) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }} ref={menuRef}>
          {/* Light/Dark Mode toggle */}
          <button onClick={toggleTheme} style={{
            width:34, height:34, borderRadius:8, background:'var(--bg)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text2)', transition:'all 0.15s'
          }} onMouseEnter={e=>e.currentTarget.style.background='var(--hover-bg)'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg)'}>
            {theme === 'dark' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>

          {/* Avatar Dropdown Button */}
          <button onClick={() => setMenuOpen(m => !m)} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'3px 12px 3px 3px', borderRadius:99, background:'transparent',
            border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s'
          }} onMouseEnter={e=>e.currentTarget.style.background='var(--hover-bg)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'var(--surface2)', border: '1px solid var(--border)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:600, color:'var(--text)',
            }}>{initial}</div>
            <span style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>{user?.username || 'Admin'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          
          {menuOpen && (
            <div style={{ position:'absolute', top:'100%', right:0, marginTop:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, width:220, display:'flex', flexDirection:'column', boxShadow:'0 12px 40px var(--border-md)', overflow:'hidden' }}>
              <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid var(--border-sm)' }}>
                <div style={{ fontSize:14, fontWeight:800, color:'var(--text)' }}>{user?.username || 'Admin'} {user?.role || ''}</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{user?.email || 'admin@apex.com'}</div>
              </div>
              <div style={{ padding: '8px' }}>
                <button onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'10px 12px', background:'transparent', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:600, color:'#e11d48', transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(225,29,72,0.08)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setOpen(o => !o)} className="nav-mobile-btn"
          style={{
            marginLeft: 'auto',
            background: open ? 'var(--primary-pale)' : 'var(--border-sm)',
            border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
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
        borderTop: '0.5px solid var(--border)',
        boxShadow: '0 -1px 0 var(--border-sm), 0 -4px 20px var(--border)',
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
                        width: 40, height: 34, borderRadius: 6,
                        background: 'var(--hover-bg)', zIndex: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.div className="bottom-tab-icon"
                    animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -1 : 0, color: isActive ? 'var(--primary)' : 'var(--text4)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text4)', position: 'relative', zIndex: 1 }}
                  >
                    <NavIcon name={tab.icon} size={21} />
                  </motion.div>
                  <span className="bottom-tab-label"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text4)', fontWeight: isActive ? 500 : 400 }}
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