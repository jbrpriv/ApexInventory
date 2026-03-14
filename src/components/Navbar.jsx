import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/',         label: 'Home',    end: true  },
  { to: '/accounts', label: 'Accounts',end: false },
  { to: '/stats',    label: 'Stats',   end: false },
  { to: '/export',   label: 'Export',  end: false },
  { to: '/about',    label: 'About',   end: false },
  { to: '/profile',  label: 'Profile', end: false },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => setOpen(false), [location]);

  const initial = (user?.username?.[0] || 'A').toUpperCase();

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        height: 'var(--nav-h)',
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)'}`,
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 8,
        boxShadow: scrolled ? 'var(--sh-sm)' : 'none',
        transition: 'all 0.25s',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0, marginRight:8 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#4F46E5,#818CF8)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'white', boxShadow:'0 2px 8px rgba(79,70,229,0.3)' }}>A</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px', lineHeight:1 }}>Apex</div>
            <div style={{ fontSize:8.5, color:'var(--primary-light)', letterSpacing:2, fontWeight:600 }}>MANAGER</div>
          </div>
        </NavLink>

        <div style={{ width:1, height:18, background:'var(--border)', marginRight:4 }} />

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display:'flex', gap:2, flex:1 }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({isActive}) => `nav-link${isActive?' nav-link-active':''}`}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* User */}
        <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px 5px 5px', background:'var(--surface2)', borderRadius:99, border:'1px solid var(--border)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#4F46E5,#818CF8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white' }}>{initial}</div>
            <span style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>{user?.username}</span>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding:'6px 14px', borderRadius:7, fontSize:12.5, fontWeight:600, background:'#FFF1F2', border:'1px solid #FECACA', color:'#E11D48', cursor:'pointer', transition:'all 0.18s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#FFE4E6';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#FFF1F2';}}
          >Sign Out</button>
        </div>

        {/* Mobile burger */}
        <button onClick={()=>setOpen(o=>!o)} className="nav-mobile-btn" style={{ marginLeft:'auto', background:open?'var(--primary-pale)':'var(--surface2)', border:`1px solid ${open?'var(--primary-light)':'var(--border)'}`, color:open?'var(--primary)':'var(--text2)', width:36, height:36, borderRadius:8, display:'none', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.18s', fontSize:16 }}>{open?'✕':'☰'}</button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="slide-down" style={{ position:'fixed', top:'var(--nav-h)', left:0, right:0, zIndex:499, background:'rgba(255,255,255,0.97)', borderBottom:'1px solid var(--border)', backdropFilter:'blur(20px)', paddingBottom:8, boxShadow:'var(--sh-md)' }}>
          {LINKS.map(l=>(
            <NavLink key={l.to} to={l.to} end={l.end} onClick={()=>setOpen(false)}
              className={({isActive})=>`nav-mobile-link${isActive?' nav-mobile-link-active':''}`}
            >{l.label}</NavLink>
          ))}
          <div style={{ margin:'10px 24px 0', paddingTop:12, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>@{user?.username}</span>
            <button onClick={()=>{logout();navigate('/login');}} style={{ padding:'7px 16px', borderRadius:7, fontSize:13, fontWeight:600, background:'#FFF1F2', border:'1px solid #FECACA', color:'#E11D48', cursor:'pointer' }}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  );
}
