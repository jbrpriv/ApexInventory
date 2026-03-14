import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authLogin, getBackground } from '../api';

export default function LoginPage() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [bgUrl, setBgUrl] = useState('');
  const [focused, setFocused] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { getBackground().then(r=>setBgUrl(r.data.url||'')).catch(()=>{}); }, []);

  const set = (k) => (e) => { setForm(f=>({...f,[k]:e.target.value})); setError(''); };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username||!form.password) return setError('All fields required');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch(err) { setError(err.response?.data?.message||'Invalid credentials'); }
    finally { setLoading(false); }
  };

  const inpStyle = (name) => ({
    width:'100%', padding:'12px 14px 12px 40px',
    background: focused===name ? 'rgba(0,217,255,0.04)' : 'rgba(255,255,255,0.03)',
    border: `1.5px solid ${focused===name ? 'var(--neon)' : error ? 'rgba(255,51,85,0.3)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius:8, color:'var(--text)', fontFamily:'var(--font-body)',
    fontSize:14, outline:'none',
    boxShadow: focused===name ? '0 0 0 3px rgba(0,217,255,0.08)' : 'none',
    transition:'all 0.2s',
  });

  return (
    <div style={{
      minHeight:'100vh', display:'flex', position:'relative',
      background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'var(--void)',
      fontFamily:'var(--font-body)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--void); }
        @keyframes orbDrift{0%,100%{transform:translate(0,0)}33%{transform:translate(20px,-30px)}66%{transform:translate(-15px,15px)}}
        @keyframes gridScroll{from{transform:translateY(0)}to{transform:translateY(56px)}}
        @keyframes formReveal{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes brandReveal{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glitch1{0%,100%{clip-path:inset(0 0 95% 0)}20%{clip-path:inset(30% 0 60% 0)}40%{clip-path:inset(60% 0 30% 0)}60%{clip-path:inset(80% 0 10% 0)}80%{clip-path:inset(10% 0 80% 0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:700px){.login-brand{display:none!important}}
      `}</style>

      {/* Orbs */}
      {!bgUrl && <>
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'rgba(0,217,255,0.15)', filter:'blur(100px)', animation:'orbDrift 10s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'rgba(155,92,255,0.12)', filter:'blur(80px)', animation:'orbDrift 14s ease-in-out 2s infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', width:300, height:300, borderRadius:'50%', background:'rgba(255,0,110,0.08)', filter:'blur(70px)', animation:'orbDrift 12s ease-in-out 4s infinite', pointerEvents:'none' }} />
      </>}

      {/* Scrolling grid */}
      {!bgUrl && <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{
          position:'absolute', inset:0, opacity:0.035,
          backgroundImage:'linear-gradient(rgba(0,217,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,1) 1px,transparent 1px)',
          backgroundSize:'56px 56px',
          animation:'gridScroll 4s linear infinite',
        }} />
      </div>}

      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(7,9,15,0.7) 0%, rgba(7,9,15,0.8) 100%)' }} />

      {/* Brand panel */}
      <div className="login-brand" style={{
        position:'relative', zIndex:1, flex:1,
        display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px',
        animation:'brandReveal 0.8s cubic-bezier(.22,.68,0,1.1) 0.1s both',
      }}>
        {/* Logo */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:64 }}>
          <div style={{ position:'relative', width:46, height:46 }}>
            <svg width="46" height="46" viewBox="0 0 46 46" style={{ position:'absolute' }}>
              <circle cx="23" cy="23" r="20" fill="none" stroke="rgba(0,217,255,0.2)" strokeWidth="1.5" />
              <circle cx="23" cy="23" r="20" fill="none" stroke="var(--neon)" strokeWidth="1.5"
                strokeDasharray="28 98" strokeLinecap="round"
                style={{ animation:'logoSpin 3s linear infinite', transformOrigin:'23px 23px' }} />
            </svg>
            <div style={{
              position:'absolute', inset:'8px', borderRadius:'50%',
              background:'linear-gradient(135deg, var(--neon), var(--violet))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'#000',
            }}>A</div>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:3, lineHeight:1 }}>APEX</div>
            <div style={{ fontSize:8, color:'var(--neon)', letterSpacing:4, opacity:0.7, fontFamily:'var(--font-display)' }}>MANAGER</div>
          </div>
        </div>

        <div style={{ fontSize:10, color:'var(--neon)', letterSpacing:5, fontFamily:'var(--font-display)', textTransform:'uppercase', marginBottom:20, opacity:0.7 }}>Account Inventory System</div>

        <h1 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(38px,4.5vw,58px)',
          fontWeight:700, color:'var(--text)', lineHeight:1.0,
          letterSpacing:'-0.5px', marginBottom:22,
        }}>
          MANAGE YOUR<br/>
          <span style={{ background:'linear-gradient(90deg, var(--neon), var(--violet))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 20px rgba(0,217,255,0.4))' }}>
            APEX ACCOUNTS
          </span>
        </h1>

        <p style={{ color:'rgba(232,240,255,0.4)', fontSize:14.5, lineHeight:1.75, maxWidth:340 }}>
          Track ban status, manage credentials, rank accounts and monitor your complete inventory — all in one dark command center.
        </p>

        <div style={{ display:'flex', gap:10, marginTop:44, flexWrap:'wrap' }}>
          {['Account Tracking','Sales Management','Stats & Analytics'].map(f=>(
            <span key={f} style={{
              padding:'5px 14px', borderRadius:99, fontSize:11, fontWeight:600,
              fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase',
              background:'rgba(0,217,255,0.06)', border:'1px solid rgba(0,217,255,0.2)',
              color:'rgba(0,217,255,0.7)',
            }}>{f}</span>
          ))}
        </div>

        {/* Vertical neon line */}
        <div style={{ position:'absolute', right:0, top:'15%', bottom:'15%', width:1, background:'linear-gradient(180deg, transparent, rgba(0,217,255,0.2), transparent)' }} />
      </div>

      {/* Form panel */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px', width:'100%', maxWidth:460, flexShrink:0,
        animation:'formReveal 0.8s cubic-bezier(.22,.68,0,1.1) 0.2s both',
      }}>
        <div style={{
          background:'rgba(13,17,26,0.85)',
          border:'1px solid rgba(0,217,255,0.15)',
          borderRadius:20, padding:'36px 32px', width:'100%', maxWidth:400,
          backdropFilter:'blur(24px)',
          boxShadow:'0 32px 100px rgba(0,0,0,0.7), 0 0 60px rgba(0,217,255,0.08)',
        }}>
          {/* Top accent */}
          <div style={{ height:2, background:'linear-gradient(90deg, transparent, var(--neon), var(--violet), transparent)', borderRadius:'20px 20px 0 0', marginBottom:28, marginLeft:-32, marginRight:-32, marginTop:-36 }} />

          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Welcome Back</h2>
            <p style={{ color:'var(--text3)', fontSize:13 }}>Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Username */}
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--text3)', letterSpacing:2, textTransform:'uppercase', fontFamily:'var(--font-display)', marginBottom:8 }}>Username</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color: focused==='username' ? 'var(--neon)' : 'var(--text3)', transition:'color 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <input type="text" value={form.username} onChange={set('username')} placeholder="Username" autoFocus autoComplete="username"
                  style={inpStyle('username')}
                  onFocus={()=>setFocused('username')} onBlur={()=>setFocused('')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--text3)', letterSpacing:2, textTransform:'uppercase', fontFamily:'var(--font-display)', marginBottom:8 }}>Password</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color: focused==='password' ? 'var(--neon)' : 'var(--text3)', transition:'color 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Password" autoComplete="current-password"
                  style={{ ...inpStyle('password'), paddingRight:44 }}
                  onFocus={()=>setFocused('password')} onBlur={()=>setFocused('')}
                />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:4, display:'flex', alignItems:'center', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--neon)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}
                >
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'var(--danger-dim)', border:'1px solid rgba(255,51,85,0.3)', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop:4, padding:'13px', borderRadius:9, fontSize:14, fontWeight:700,
              fontFamily:'var(--font-display)', letterSpacing:2, textTransform:'uppercase',
              background: loading ? 'rgba(0,217,255,0.2)' : 'transparent',
              border: `1.5px solid ${loading ? 'rgba(0,217,255,0.3)' : 'var(--neon)'}`,
              color: loading ? 'rgba(0,217,255,0.5)' : 'var(--neon)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,217,255,0.2)',
              transition:'all 0.25s', position:'relative', overflow:'hidden',
            }}
              onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background='var(--neon-dim)'; e.currentTarget.style.boxShadow='var(--sh-neon)'; }}}
              onMouseLeave={e=>{ if(!loading){ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,217,255,0.2)'; }}}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg style={{ animation:'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Authenticating...
                </span>
              ) : 'Access System →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:22, color:'var(--text4)', fontSize:11, fontFamily:'var(--font-display)', letterSpacing:2 }}>APEX LEGENDS · ACCOUNT MANAGER</div>
        </div>
      </div>
      <style>{`@keyframes logoSpin{to{transform:rotate(360deg)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
