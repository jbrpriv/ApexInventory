import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function PremiumButton({ children, onClick, disabled, style={}, color='#ea580c' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-2, boxShadow:`0 8px 28px ${color}50`}:{}}
      whileTap={!disabled?{scale:0.98}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 20px', borderRadius:10, fontSize:13.5, fontWeight:700, background:disabled?`${color}40`:`linear-gradient(135deg,${color},${color}dd)`, border:'none', color:'#1C1917', cursor:disabled?'not-allowed':'pointer', boxShadow:disabled?'none':`0 2px 12px ${color}40`, transition:'background 0.18s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', marginTop:4, fontFamily:'inherit', ...style }}
    >
      <motion.div initial={{x:'-100%'}} animate={{x:hovered&&!disabled?'200%':'-100%'}} transition={{duration:0.9}}
        style={{ position:'absolute', top:0, left:0, width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', pointerEvents:'none' }}
      />
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>{children}</span>
    </motion.button>
  );
}

const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } };
const cardV = { hidden:{ opacity:0, y:30 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:24 } } };

export default function ExportPage() {
  const { token } = useAuth();
  const base = process.env.REACT_APP_API_URL || '';
  const [downloading, setDownloading] = useState('');

  const download = (id, path) => {
    setDownloading(id);
    const a = document.createElement('a');
    a.href = base + path + '?token=' + token;
    a.click();
    setTimeout(()=>setDownloading(''), 1500);
  };

  const exports = [
    { id:'csv',  label:'CSV',  title:'Spreadsheet Export', desc:'All accounts as a CSV. Compatible with Excel, Google Sheets, and any spreadsheet app.', meta:'Email · Password · Recovery · Level · Status · Sales · Price · Rank', color:'#22c55e', path:'/api/export/csv' },
    { id:'json', label:'JSON', title:'Raw Data Export',    desc:'Complete records as JSON. Ideal for backups, imports, and developer tooling.',            meta:'Full document · All fields · Timestamps included',                     color:'#38bdf8', path:'/api/export/json' },
  ];

  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:820, margin:'0 auto', minHeight:'100vh' }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ width:3, height:16, borderRadius:99, background:'#ea580c', display:'inline-block', boxShadow:'0 0 8px rgba(234,88,12,0.5)' }} />
          <p style={{ fontSize:11, fontWeight:700, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>Data</p>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'#1C1917', marginBottom:8, letterSpacing:'-0.5px' }}>Export Accounts</h1>
        <p style={{ color:'rgba(28,25,23,0.45)', fontSize:14, marginBottom:36 }}>Download all account data in your preferred format.</p>
      </motion.div>

      <motion.div variants={containerV} initial="hidden" animate="visible"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:24 }}
      >
        {exports.map(ex => {
          const isLoading = downloading === ex.id;
          return (
            <motion.div key={ex.id} variants={cardV}
              whileHover={{ y:-3, boxShadow:'0 12px 40px rgba(0,0,0,0.6)' }}
              style={{ background:'#FFFFFF', border:`1px solid ${ex.color}25`, borderRadius:16, padding:'26px 24px', display:'flex', flexDirection:'column', gap:16, position:'relative', overflow:'hidden' }}
            >
              {/* Top accent */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${ex.color},transparent)` }} />
              {/* Glow blob */}
              <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:ex.color, opacity:0.04, filter:'blur(30px)', pointerEvents:'none' }} />

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:50, height:50, borderRadius:12, background:`${ex.color}15`, border:`1px solid ${ex.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ex.color} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11.5, fontWeight:700, background:`${ex.color}15`, color:ex.color, border:`1px solid ${ex.color}30` }}>.{ex.label}</span>
              </div>

              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#1C1917', marginBottom:6 }}>{ex.title}</div>
                <div style={{ fontSize:13.5, color:'rgba(28,25,23,0.5)', lineHeight:1.65 }}>{ex.desc}</div>
              </div>

              <div style={{ fontSize:12, color:'rgba(28,25,23,0.35)', background:'rgba(0,0,0,0.04)', padding:'8px 12px', borderRadius:8, fontFamily:'var(--font-mono)', border:'1px solid rgba(0,0,0,0.06)' }}>{ex.meta}</div>

              <PremiumButton onClick={()=>download(ex.id,ex.path)} disabled={isLoading} color={ex.color}>
                {isLoading
                  ? <><svg style={{animation:'spin 0.7s linear infinite'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Exporting…</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download {ex.label}</>
                }
              </PremiumButton>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'14px 18px', fontSize:13.5, color:'#f59e0b', display:'flex', alignItems:'flex-start', gap:10 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span><strong>Warning:</strong> Exported files contain sensitive credentials. Store securely and never share.</span>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
