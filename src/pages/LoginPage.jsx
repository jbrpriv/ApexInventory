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
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { getBackground().then(r => setBgUrl(r.data.url||'')).catch(()=>{}); }, []);

  const set = (k) => (e) => { setForm(f=>({...f,[k]:e.target.value})); setError(''); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username||!form.password) return setError('Please fill in all fields');
    setLoading(true); setError('');
    try {
      const res = await authLogin(form);
      login(res.data.token, res.data.username);
      navigate('/');
    } catch (err) { setError(err.response?.data?.message||'Invalid credentials'); }
    finally { setLoading(false); }
  };

  const iStyle = (err) => ({
    width:'100%', background:err?'#fef2f2':'white',
    border:'1.5px solid '+(err?'#fca5a5':'#d1d5db'), color:'#0f172a',
    padding:'12px 16px', borderRadius:10, fontFamily:"'Inter',sans-serif",
    fontSize:14, outline:'none', transition:'border-color 0.18s, box-shadow 0.18s',
  });

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
      fontFamily:"'Inter',system-ui,sans-serif", position:'relative', padding:20,
    }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.6)' }}/>
      <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>

      <div className="scale-in" style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:60, height:60, borderRadius:16, margin:'0 auto 16px',
            background:'linear-gradient(135deg, #4f46e5, #818cf8)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 24px rgba(79,70,229,0.5)',
            fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:26, fontWeight:800, color:'white',
          }}>A</div>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:26, fontWeight:800, color:'white', letterSpacing:'-0.5px' }}>Apex Manager</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, letterSpacing:3, marginTop:5, textTransform:'uppercase' }}>Account Inventory</div>
        </div>

        {/* Card */}
        <div style={{ background:'white', borderRadius:20, padding:'30px 28px 26px', boxShadow:'0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize:15, fontWeight:600, color:'#334155', marginBottom:22 }}>Sign in to continue</div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.2, textTransform:'uppercase', marginBottom:6 }}>Username</label>
              <input type="text" value={form.username} onChange={set('username')} placeholder="Your username"
                autoFocus autoComplete="username" style={iStyle(false)}
                onFocus={e=>{e.target.style.borderColor='#4f46e5';e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)';}}
                onBlur={e=>{e.target.style.borderColor='#d1d5db';e.target.style.boxShadow='none';}}
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.2, textTransform:'uppercase', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Your password"
                  autoComplete="current-password" style={{ ...iStyle(false), paddingRight:44 }}
                  onFocus={e=>{e.target.style.borderColor='#4f46e5';e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)';}}
                  onBlur={e=>{e.target.style.borderColor='#d1d5db';e.target.style.boxShadow='none';}}
                />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#94a3b8', cursor:'pointer',
                  padding:4, display:'flex', alignItems:'center',
                }}>
                  {showPw
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop:4, padding:'13px', borderRadius:10, fontSize:15, fontWeight:700,
              background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border:'none', color:'white', cursor: loading?'not-allowed':'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(79,70,229,0.35)',
              transition:'all 0.18s',
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', marginTop:20, color:'rgba(255,255,255,0.3)', fontSize:12 }}>
          Apex Legends Account Manager
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{background:#1e1b4b}
      `}</style>
    </div>
  );
}
