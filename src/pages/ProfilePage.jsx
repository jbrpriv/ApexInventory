import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authChangePassword, uploadBackground, resetBackground, getBackground } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function PremiumButton({ children, onClick, disabled, color='#ea580c', style={} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-1, boxShadow:`0 6px 20px ${color}45`}:{}}
      whileTap={!disabled?{scale:0.98}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 20px', borderRadius:10, fontSize:14, fontWeight:700, background:disabled?`${color}35`:`linear-gradient(135deg,${color},${color}dd)`, border:'none', color:'white', cursor:disabled?'not-allowed':'pointer', transition:'all 0.18s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', ...style }}
    >
      <motion.div initial={{x:'-100%'}} animate={{x:hovered&&!disabled?'200%':'-100%'}} transition={{duration:0.9}}
        style={{ position:'absolute', top:0, left:0, width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', pointerEvents:'none' }}
      />
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>{children}</span>
    </motion.button>
  );
}

const cardV = { hidden:{ opacity:0, y:24 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:24 } } };
const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPws, setShowPws] = useState({});
  const [bgUrl, setBgUrl] = useState('');
  const [bgUploading, setBgUploading] = useState(false);
  const fileRef = useRef();

  React.useEffect(() => {
    getBackground().then(r=>setBgUrl(r.data.url||'')).catch(()=>{});
  }, []);

  const setPw = k => e => setPwForm(f=>({...f,[k]:e.target.value}));

  const handleChangePassword = async e => {
    e.preventDefault();
    if (!pwForm.currentPassword||!pwForm.newPassword) return toast.error('Fill in all fields');
    if (pwForm.newPassword!==pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length<6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try { await authChangePassword({ currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword }); toast.success('Password changed!'); setPwForm({ currentPassword:'', newPassword:'', confirm:'' }); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setPwLoading(false); }
  };

  const handleBgUpload = async e => {
    const file=e.target.files[0]; if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return toast.error('JPG, PNG or WEBP only');
    setBgUploading(true);
    try { const fd=new FormData(); fd.append('image',file); const res=await uploadBackground(fd); toast.success('Background updated!'); setBgUrl(res.data.url); }
    catch(err) { toast.error(err.response?.data?.message||'Upload failed'); }
    finally { setBgUploading(false); }
  };

  const handleBgReset = async () => {
    try { await resetBackground(); setBgUrl(''); toast.success('Background reset'); }
    catch { toast.error('Reset failed'); }
  };

  const inpStyle = { background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', color:'white', padding:'10px 42px 10px 14px', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', width:'100%', transition:'all 0.18s' };
  const cardStyle = { background:'#0c0c14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'22px 24px', marginBottom:16, boxShadow:'0 2px 12px rgba(0,0,0,0.4)' };
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:7 };
  const fi = e => { e.target.style.borderColor='rgba(234,88,12,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(234,88,12,0.1)'; e.target.style.background='rgba(234,88,12,0.06)'; };
  const fo = e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.05)'; };

  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:540, margin:'0 auto', minHeight:'100vh' }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ width:3, height:16, borderRadius:99, background:'#ea580c', display:'inline-block', boxShadow:'0 0 8px rgba(234,88,12,0.5)' }} />
          <p style={{ fontSize:11, fontWeight:700, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>Account</p>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'white', marginBottom:28, letterSpacing:'-0.5px' }}>Profile</h1>
      </motion.div>

      <motion.div variants={containerV} initial="hidden" animate="visible">

        {/* User info */}
        <motion.div variants={cardV} style={{ ...cardStyle, borderTop:'2px solid #ea580c', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'#ea580c', opacity:0.04, filter:'blur(30px)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#ea580c,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'white', fontFamily:'var(--font-display)', boxShadow:'0 4px 20px rgba(234,88,12,0.4)' }}>
              {(user?.username?.[0]||'A').toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'white' }}>{user?.username||'Admin'}</div>
              <div style={{ fontSize:11, color:'#ea580c', letterSpacing:2, marginTop:2, fontWeight:700, textTransform:'uppercase' }}>Administrator</div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={cardV} style={cardStyle}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <span style={{ width:3, height:12, borderRadius:99, background:'rgba(255,255,255,0.3)', display:'inline-block' }} />
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1.5, textTransform:'uppercase' }}>Change Password</p>
          </div>
          <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[{key:'currentPassword',label:'Current Password'},{key:'newPassword',label:'New Password'},{key:'confirm',label:'Confirm New Password'}].map(f=>(
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <input type={showPws[f.key]?'text':'password'} value={pwForm[f.key]} onChange={setPw(f.key)} placeholder="••••••••" style={inpStyle} onFocus={fi} onBlur={fo}/>
                  <button type="button" onClick={()=>setShowPws(p=>({...p,[f.key]:!p[f.key]}))} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', display:'flex', alignItems:'center', padding:4, transition:'color 0.15s', minHeight:'auto', minWidth:'auto' }} onMouseEnter={e=>e.currentTarget.style.color='#ea580c'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                    {showPws[f.key]
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            ))}
            <PremiumButton onClick={handleChangePassword} disabled={pwLoading} style={{ marginTop:4 }}>
              {pwLoading?'Updating…':'Update Password'}
            </PremiumButton>
          </form>
        </motion.div>

        {/* Background */}
        <motion.div variants={cardV} style={cardStyle}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ width:3, height:12, borderRadius:99, background:'rgba(255,255,255,0.3)', display:'inline-block' }} />
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1.5, textTransform:'uppercase' }}>Dashboard Background</p>
          </div>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,0.35)', marginBottom:18, lineHeight:1.55 }}>Customize the hero image on the home page.</p>
          {bgUrl && (
            <div style={{ borderRadius:12, overflow:'hidden', height:120, marginBottom:16, position:'relative', border:'1px solid rgba(255,255,255,0.1)' }}>
              <img src={bgUrl} alt="Background" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.6) 100%)', display:'flex', alignItems:'flex-end', padding:'10px 12px' }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600, background:'rgba(0,0,0,0.5)', padding:'3px 10px', borderRadius:99 }}>Current Background</span>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBgUpload} style={{ display:'none' }}/>
          <div style={{ display:'flex', gap:10 }}>
            <PremiumButton onClick={()=>fileRef.current.click()} disabled={bgUploading} style={{ flex:1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {bgUploading?'Uploading…':bgUrl?'Change Image':'Add Image'}
            </PremiumButton>
            {bgUrl && (
              <motion.button onClick={handleBgReset} whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
                style={{ padding:'11px 16px', borderRadius:10, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#f43f5e', fontSize:13.5, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'background 0.15s', fontFamily:'inherit' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(244,63,94,0.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(244,63,94,0.1)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>Reset
              </motion.button>
            )}
          </div>
          <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.2)', marginTop:10 }}>JPG, PNG, WEBP · Max 10MB</p>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={cardV} style={{ ...cardStyle, borderTop:'2px solid #f43f5e', marginBottom:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <span style={{ width:3, height:12, borderRadius:99, background:'#f43f5e', display:'inline-block' }} />
            <p style={{ fontSize:11, fontWeight:700, color:'#f43f5e', letterSpacing:1.5, textTransform:'uppercase' }}>Danger Zone</p>
          </div>
          <motion.button onClick={()=>{logout();navigate('/login');}} whileHover={{ y:-1, boxShadow:'0 4px 16px rgba(244,63,94,0.25)' }} whileTap={{ scale:0.98 }}
            style={{ width:'100%', padding:'12px', background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#f43f5e', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(244,63,94,0.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(244,63,94,0.1)'}
          >Sign Out</motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
