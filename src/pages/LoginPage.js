import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authLogin } from '../api';
import ParticleBackground from '../components/ParticleBackground';

export default function LoginPage() {
  const [form, setForm]   = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setError(''); };

  const handleSubmit = async e => {
    e?.preventDefault();
    if (!form.username||!form.password) return setError('Please fill in all fields');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch(err) { setError(err.response?.data?.message||'Invalid credentials'); }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'11px 14px 11px 40px',
    background:'white', border:'1.5px solid #E5E7EB',
    color:'#111827', borderRadius:10, fontFamily:'inherit',
    fontSize:14, outline:'none', transition:'all 0.18s',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', position:'relative', background:'#F7F8FC', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:700px){.login-brand{display:none!important}}
      `}</style>

      <ParticleBackground />

      {/* Brand panel */}
      <div className="login-brand" style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px', animation:'fadeSlide 0.7s ease 0.1s both' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:56 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,#4F46E5,#818CF8)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:'white', boxShadow:'0 4px 16px rgba(79,70,229,0.3)' }}>A</div>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:'#111827', lineHeight:1 }}>Apex Manager</div>
            <div style={{ fontSize:10, color:'#6B7280', letterSpacing:2, marginTop:2 }}>ACCOUNT INVENTORY</div>
          </div>
        </div>
        <p style={{ fontSize:11.5, fontWeight:600, color:'var(--primary,#4F46E5)', letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>Command Your Accounts</p>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(32px,4vw,48px)', fontWeight:700, color:'#111827', lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:18 }}>
          Manage your<br />
          <span style={{ color:'#4F46E5' }}>Apex Legends</span><br />
          accounts
        </h1>
        <p style={{ color:'#6B7280', fontSize:15, lineHeight:1.7, maxWidth:320 }}>
          Track ban status, manage credentials, monitor ranks and sales — all in one clean dashboard.
        </p>
        <div style={{ display:'flex', gap:10, marginTop:40, flexWrap:'wrap' }}>
          {['Account Tracking','Sales Management','Apex Sync','Stats & Analytics'].map(f=>(
            <span key={f} style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:500, background:'white', border:'1px solid #E5E7EB', color:'#374151', boxShadow:'var(--sh-xs,0 1px 2px rgba(0,0,0,0.04))' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', width:'100%', maxWidth:460, flexShrink:0, animation:'fadeSlide 0.7s ease 0.2s both' }}>
        <div style={{ background:'white', borderRadius:20, padding:'36px 32px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:700, color:'#111827', marginBottom:6 }}>Welcome back</h2>
            <p style={{ color:'#6B7280', fontSize:13.5 }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#374151', letterSpacing:0.5, textTransform:'uppercase', marginBottom:7 }}>Username</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <input type="text" value={form.username} onChange={set('username')} placeholder="Your username" autoFocus autoComplete="username" style={inp}
                  onFocus={e=>{e.target.style.borderColor='#4F46E5';e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)';}}
                  onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.boxShadow='none';}}
                />
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#374151', letterSpacing:0.5, textTransform:'uppercase', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" style={{...inp,paddingRight:44}}
                  onFocus={e=>{e.target.style.borderColor='#4F46E5';e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)';}}
                  onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.boxShadow='none';}}
                />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', padding:4, display:'flex', alignItems:'center', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#4F46E5'}
                  onMouseLeave={e=>e.currentTarget.style.color='#9CA3AF'}
                >
                  {showPw?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            {error&&<div style={{ background:'#FFF1F2', border:'1px solid #FECACA', color:'#E11D48', padding:'10px 14px', borderRadius:9, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>}

            <button type="submit" disabled={loading} style={{ marginTop:4, padding:'13px', borderRadius:10, fontSize:14.5, fontWeight:600, background:loading?'#C7D2FE':'linear-gradient(135deg,#4F46E5,#6366F1)', border:'none', color:'white', cursor:loading?'not-allowed':'pointer', boxShadow:loading?'none':'0 4px 16px rgba(79,70,229,0.3)', transition:'all 0.18s', fontFamily:'inherit' }}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(79,70,229,0.35)';}}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=loading?'none':'0 4px 16px rgba(79,70,229,0.3)';}}
            >
              {loading?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><svg style={{animation:'spin 0.8s linear infinite'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Signing in…</span>:'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'#9CA3AF', fontSize:12 }}>Apex Legends Account Manager</p>
        </div>
      </div>
    </div>
  );
}
