import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authLogin } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

let ParticleBackground = null;
try { ParticleBackground = require('../components/ParticleBackground').default; } catch {}

/* ── PremiumButton with shine sweep ─────────────────────── */
function PremiumButton({ children, onClick, disabled, loading, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={!disabled ? { y: -2, boxShadow: '0 8px 32px rgba(234,88,12,0.5)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', padding: '14px',
        borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: disabled ? 'rgba(234,88,12,0.3)' : 'linear-gradient(135deg,#ea580c,#f97316)',
        border: 'none', color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(234,88,12,0.35)',
        transition: 'background 0.18s',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {/* Shine sweep */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: hovered && !disabled ? '200%' : '-100%' }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '60%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {children}
      </span>
    </motion.button>
  );
}

const fieldV = {
  hidden: { opacity: 0, x: -16 },
  visible: i => ({
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28, delay: 0.25 + i * 0.08 },
  }),
};

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async e => {
    e?.preventDefault();
    if (!form.username || !form.password) return setError('Please fill in all fields');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const inpStyle = {
    width: '100%', padding: '13px 14px 13px 42px',
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: 11,
    fontFamily: 'inherit', fontSize: 15, outline: 'none',
    transition: 'all 0.18s', WebkitAppearance: 'none',
  };

  return (
    <div className="login-root" style={{
      minHeight: '100dvh', display: 'flex',
      position: 'relative', background: '#0a0a0f',
      fontFamily: "'Inter', sans-serif", overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.25)!important}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 999px #111120 inset!important;-webkit-text-fill-color:white!important;}
      `}</style>

      {ParticleBackground && <ParticleBackground />}

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'-10%', left:'30%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(234,88,12,0.08),transparent 70%)', filter:'blur(80px)', pointerEvents:'none', zIndex:1 }} />
      <div style={{ position:'absolute', bottom:'-5%', right:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(234,88,12,0.05),transparent 70%)', filter:'blur(60px)', pointerEvents:'none', zIndex:1 }} />

      {/* Grid lines */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none', zIndex:1 }} />

      {/* Brand panel — desktop */}
      <div className="login-brand" style={{ position:'relative', zIndex:2, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px' }}>
        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1, type:'spring', stiffness:200, damping:26 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:56 }}>
            <div style={{ width:44, height:44, borderRadius:11, background:'linear-gradient(135deg,#ea580c,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:'white', boxShadow:'0 4px 20px rgba(234,88,12,0.45)' }}>A</div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:'white', lineHeight:1 }}>Apex Manager</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:2, marginTop:2 }}>ACCOUNT INVENTORY</div>
            </div>
          </div>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99, background:'rgba(234,88,12,0.1)', border:'1px solid rgba(234,88,12,0.25)', marginBottom:20 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#ea580c', boxShadow:'0 0 6px #ea580c', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:600, color:'#fb923c', letterSpacing:2, textTransform:'uppercase' }}>Command Your Accounts</span>
          </div>

          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(32px,4vw,52px)', fontWeight:800, color:'white', lineHeight:1.05, letterSpacing:'-1px', marginBottom:18 }}>
            Manage your<br />
            <span style={{ color:'transparent', backgroundClip:'text', WebkitBackgroundClip:'text', backgroundImage:'linear-gradient(135deg,#ea580c,#fb923c)' }}>Apex Legends</span><br />
            accounts
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:320 }}>
            Track ban status, manage credentials, monitor ranks and sales — all in one clean dashboard.
          </p>

          <div style={{ display:'flex', gap:10, marginTop:40, flexWrap:'wrap' }}>
            {['Account Tracking','Sales Management','Apex Sync','Stats & Analytics'].map((f, i) => (
              <motion.span key={f} initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5+i*0.07, type:'spring', stiffness:300 }}
                style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:500, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}
              >{f}</motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="login-form-wrap" style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px', width:'100%', maxWidth:480, flexShrink:0 }}>
        <motion.div className="login-card"
          initial={{ opacity:0, y:60 }}
          animate={{ opacity:1, y:0 }}
          transition={{ type:'spring', stiffness:280, damping:30, delay:0.15 }}
          style={{ background:'#0c0c14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, padding:'36px 32px', width:'100%', maxWidth:400, boxShadow:'0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {/* Top accent line */}
          <div style={{ height:2, background:'linear-gradient(90deg,#ea580c,#f97316,transparent)', borderRadius:99, marginBottom:28 }} />

          {/* Mobile logo */}
          <div className="show-mobile" style={{ display:'none', alignItems:'center', gap:10, marginBottom:24 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#ea580c,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'white' }}>A</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:'white' }}>Apex Manager</div>
          </div>

          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:'white', marginBottom:6, letterSpacing:'-0.5px' }}>Welcome back</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Username */}
            <motion.div custom={0} variants={fieldV} initial="hidden" animate="visible">
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:7 }}>Username</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)', pointerEvents:'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <input type="text" value={form.username} onChange={set('username')} placeholder="Your username" autoFocus autoComplete="username" style={inpStyle}
                  onFocus={e=>{e.target.style.borderColor='rgba(234,88,12,0.6)';e.target.style.boxShadow='0 0 0 3px rgba(234,88,12,0.12)';e.target.style.background='rgba(234,88,12,0.06)';}}
                  onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.05)';}}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={1} variants={fieldV} initial="hidden" animate="visible">
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)', pointerEvents:'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" style={{...inpStyle,paddingRight:44}}
                  onFocus={e=>{e.target.style.borderColor='rgba(234,88,12,0.6)';e.target.style.boxShadow='0 0 0 3px rgba(234,88,12,0.12)';e.target.style.background='rgba(234,88,12,0.06)';}}
                  onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.05)';}}
                />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4, display:'flex', alignItems:'center', minHeight:'auto', minWidth:'auto' }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}
                  style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.3)', color:'#f43f5e', padding:'10px 14px', borderRadius:9, fontSize:13, display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div custom={2} variants={fieldV} initial="hidden" animate="visible" style={{ marginTop:4 }}>
              <PremiumButton onClick={handleSubmit} disabled={loading} loading={loading}>
                {loading
                  ? <><svg style={{animation:'spin 0.8s linear infinite'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Signing in…</>
                  : 'Sign In →'
                }
              </PremiumButton>
            </motion.div>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'rgba(255,255,255,0.2)', fontSize:12 }}>Apex Legends Account Manager</p>
        </motion.div>
      </div>
    </div>
  );
}
