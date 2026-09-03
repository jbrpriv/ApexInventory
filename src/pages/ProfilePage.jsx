import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authChangePassword, uploadBackground, resetBackground, getBackground } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, EyeOff, Eye, Image as ImageIcon, Trash2, LogOut } from 'lucide-react';

function PremiumButton({ children, onClick, disabled, color='var(--primary)', style={} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-1, boxShadow:'var(--sh-sm)'}:{}}
      whileTap={!disabled?{scale:0.98}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 20px', borderRadius:8, fontSize:14, fontWeight:600, background:disabled?'var(--border)':color, border:'none', color:disabled?'var(--text4)':'white', cursor:disabled?'not-allowed':'pointer', transition:'all 0.18s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', boxShadow:disabled?'none':'var(--sh-sm)', ...style }}
    >
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>{children}</span>
    </motion.button>
  );
}

const cardV = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:24 } } };
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

  const inpStyle = { background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', padding:'12px 42px 12px 14px', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', width:'100%', transition:'all 0.2s ease', fontWeight:500 };
  const cardStyle = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'24px', marginBottom:20, boxShadow:'var(--sh-card)', transition:'all 0.3s ease' };
  const lbl = { display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:8 };
  const fi = e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='var(--primary-glow)'; e.target.style.background='var(--surface)'; };
  const fo = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; e.target.style.background='var(--surface2)'; };

  return (
    <div className="fade-in" style={{ padding:'40px 24px', maxWidth:580, margin:'0 auto', minHeight:'100vh' }}>
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ width:4, height:16, borderRadius:99, background:'var(--primary)', display:'inline-block' }} />
          <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', letterSpacing:1.5, textTransform:'uppercase' }}>Account</p>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--text)', marginBottom:32, letterSpacing:'-0.5px' }}>Profile Settings</h1>
      </motion.div>

      <motion.div variants={containerV} initial="hidden" animate="visible">

        {/* User info */}
        <motion.div variants={cardV} style={{ ...cardStyle, borderTop:'3px solid var(--primary)', position:'relative', overflow:'hidden' }} whileHover={{ y:-2, boxShadow:'var(--sh-md)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ width:64, height:64, borderRadius:'16px', background:'var(--primary-pale)', border:'1px solid var(--primary-glow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'var(--primary)', fontFamily:'var(--font-display)' }}>
              {(user?.username?.[0]||'A').toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{user?.username||'Admin'}</div>
              <div style={{ fontSize:11.5, color:'var(--text3)', letterSpacing:1, fontWeight:600, textTransform:'uppercase' }}>Administrator</div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={cardV} style={cardStyle} whileHover={{ y:-2, boxShadow:'var(--sh-md)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
            <KeyRound size={16} style={{ color:'var(--text3)' }} />
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text2)', letterSpacing:0.5, textTransform:'uppercase' }}>Security Details</p>
          </div>
          <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[{key:'currentPassword',label:'Current Password'},{key:'newPassword',label:'New Password'},{key:'confirm',label:'Confirm New Password'}].map(f=>(
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <input type={showPws[f.key]?'text':'password'} value={pwForm[f.key]} onChange={setPw(f.key)} placeholder="••••••••" style={inpStyle} onFocus={fi} onBlur={fo}/>
                  <button type="button" onClick={()=>setShowPws(p=>({...p,[f.key]:!p[f.key]}))} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text4)', cursor:'pointer', display:'flex', alignItems:'center', padding:4, transition:'color 0.15s', minHeight:'auto', minWidth:'auto' }} onMouseEnter={e=>e.currentTarget.style.color='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text4)'}>
                    {showPws[f.key] ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            ))}
            <PremiumButton onClick={handleChangePassword} disabled={pwLoading} style={{ marginTop:8 }}>
              {pwLoading?'Updating...':'Update Password'}
            </PremiumButton>
          </form>
        </motion.div>

        {/* Background */}
        <motion.div variants={cardV} style={cardStyle} whileHover={{ y:-2, boxShadow:'var(--sh-md)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <ImageIcon size={16} style={{ color:'var(--text3)' }} />
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text2)', letterSpacing:0.5, textTransform:'uppercase' }}>Hero Image</p>
          </div>
          <p style={{ fontSize:14, color:'var(--text3)', marginBottom:24, lineHeight:1.5 }}>Customize the hero illustration displayed on the dashboard home screen.</p>
          
          {bgUrl && (
            <div style={{ borderRadius:10, overflow:'hidden', height:140, marginBottom:20, position:'relative', border:'1px solid var(--border)' }}>
              <img src={bgUrl} alt="Background" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.5) 100%)', display:'flex', alignItems:'flex-end', padding:'12px 16px' }}>
                <span style={{ fontSize:11.5, color:'white', fontWeight:600, background:'rgba(0,0,0,0.6)', padding:'4px 12px', borderRadius:99, backdropFilter:'blur(4px)' }}>Active Image</span>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBgUpload} style={{ display:'none' }}/>
          <div style={{ display:'flex', gap:12 }}>
            <PremiumButton onClick={()=>fileRef.current.click()} disabled={bgUploading} style={{ flex:1 }}>
              <ImageIcon size={16}/>
              {bgUploading?'Uploading...':bgUrl?'Replace Image':'Upload Image'}
            </PremiumButton>
            {bgUrl && (
              <motion.button onClick={handleBgReset} whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
                style={{ padding:'12px 20px', borderRadius:8, background:'var(--rose-bg)', border:'1px solid var(--rose-b)', color:'var(--rose)', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s ease', fontFamily:'inherit' }}
              >
                <Trash2 size={16}/> Clear
              </motion.button>
            )}
          </div>
          <p style={{ fontSize:12, color:'var(--text4)', marginTop:12 }}>Formats: JPG, PNG, WEBP · Max 10MB</p>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={cardV} style={{ ...cardStyle, borderTop:'3px solid var(--rose)', marginBottom:40 }} whileHover={{ y:-2, boxShadow:'var(--sh-md)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <LogOut size={16} style={{ color:'var(--rose)' }} />
            <p style={{ fontSize:13, fontWeight:600, color:'var(--rose)', letterSpacing:0.5, textTransform:'uppercase' }}>System Access</p>
          </div>
          <motion.button onClick={()=>{logout();navigate('/login');}} whileHover={{ y:-1, boxShadow:'var(--sh-sm)' }} whileTap={{ scale:0.98 }}
            style={{ width:'100%', padding:'14px', background:'var(--rose-bg)', border:'1px solid var(--rose-b)', color:'var(--rose)', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          >
            <LogOut size={16}/> Terminate Session
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
