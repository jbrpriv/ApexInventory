import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authLogin } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

/* ── PremiumButton ─────────────────────── */
function PremiumButton({ children, onClick, disabled, loading, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -2, boxShadow: 'var(--sh-md)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', padding: '14px',
        borderRadius: 8, fontSize: 14, fontWeight: 600,
        background: disabled ? 'var(--border)' : 'var(--primary)',
        border: 'none', color: disabled ? 'var(--text4)' : '#FFFFFF',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : 'var(--sh-sm)',
        transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

const fieldV = {
  hidden: { opacity: 0, y: 10 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28, delay: 0.1 + i * 0.08 },
  }),
};

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    width: '100%', padding: '13px 14px 13px 44px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)', borderRadius: 8,
    fontSize: 14, outline: 'none',
    transition: 'all 0.18s', WebkitAppearance: 'none',
  };

  return (
    <div className="login-root" style={{
      minHeight: '100dvh', display: 'flex', backgroundColor: 'var(--bg)',
    }}>
      <style>{`
        input::placeholder{color:var(--text4)!important}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 999px var(--surface2) inset!important;-webkit-text-fill-color:var(--text)!important;}
      `}</style>

      {/* Brand panel — desktop */}
      <div className="login-brand" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', borderRight: '1px solid var(--border-sm)', background: 'var(--surface)' }}>
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:'easeOut' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ width:40, height:40, borderRadius:8, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FFF', boxShadow:'var(--sh-sm)' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px', lineHeight:1 }}>Apex Inventory</div>
              <div style={{ fontSize:11, color:'var(--text4)', letterSpacing:1.5, marginTop:4, textTransform:'uppercase', fontWeight:600 }}>Administration</div>
            </div>
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px, 4vw, 48px)', fontWeight:700, color:'var(--text)', lineHeight:1.1, letterSpacing:'-1px', maxWidth:450, marginBottom:20 }}>
            Heritage security for your premium assets.
          </h1>
          <p style={{ color:'var(--text3)', fontSize:16, lineHeight:1.6, maxWidth:400 }}>
            Authenticate to access the most advanced, frictionless inventory management system.
          </p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="login-form-wrap" style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', background: 'var(--bg)' }}>
        <motion.div className="login-card"
          initial={{ opacity:0, scale:0.96 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.4, ease:'easeOut', delay:0.1 }}
          style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'40px', width:'100%', maxWidth:420, boxShadow:'var(--sh-lg)' }}
        >
          <div style={{ marginBottom:32, textAlign:'center' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)', marginBottom:8, letterSpacing:'-0.5px' }}>Welcome Back</h2>
            <p style={{ color:'var(--text4)', fontSize:14 }}>Please enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Username */}
            <motion.div custom={0} variants={fieldV} initial="hidden" animate="visible">
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Username</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text4)', pointerEvents:'none' }}>
                  <User size={18} />
                </div>
                <input type="text" value={form.username} onChange={set('username')} placeholder="admin" autoFocus autoComplete="username" style={inpStyle}
                  onFocus={e=>{e.target.style.borderColor='var(--primary)';e.target.style.boxShadow='var(--primary-glow)';e.target.style.background='var(--surface)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';e.target.style.background='var(--surface2)';}}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={1} variants={fieldV} initial="hidden" animate="visible">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>Password</label>
              </div>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text4)', pointerEvents:'none' }}>
                  <Lock size={18} />
                </div>
                <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="current-password" style={inpStyle}
                  onFocus={e=>{e.target.style.borderColor='var(--primary)';e.target.style.boxShadow='var(--primary-glow)';e.target.style.background='var(--surface)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';e.target.style.background='var(--surface2)';}}
                />
              </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}
                  style={{ background:'var(--rose-bg)', border:'1px solid var(--rose-b)', color:'var(--rose)', padding:'12px', borderRadius:8, fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8, overflow:'hidden', marginTop:4 }}
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div custom={2} variants={fieldV} initial="hidden" animate="visible" style={{ marginTop:8 }}>
              <PremiumButton onClick={handleSubmit} disabled={loading} loading={loading}>
                {loading ? <><Loader2 size={18} className="spin" /> Authenticating...</> : <><Shield size={18} /> Sign In</>}
              </PremiumButton>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Hide brand panel on very small screens, which is handled normally via media queries in standard CSS but we will just let flex do its job. */}
      {/* Since we cannot easily add a media query here without styled components or className, we will add a small global style for it in index.css if needed, but it should be fine. */}
      <style>{`
        @media (max-width: 800px) {
          .login-brand { display: none !important; }
          .login-form-wrap { padding: 20px !important; }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
