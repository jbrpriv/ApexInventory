import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Download, FileJson, FileSpreadsheet, AlertTriangle, Loader2 } from 'lucide-react';

function PremiumButton({ children, onClick, disabled, style={}, color='var(--primary)' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-1, boxShadow:'var(--sh-sm)'}:{}}
      whileTap={!disabled?{scale:0.98}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 20px', borderRadius:8, fontSize:13.5, fontWeight:600, background:disabled?'var(--border)':color, border:'none', color:disabled?'var(--text4)':'white', cursor:disabled?'not-allowed':'pointer', boxShadow:disabled?'none':'var(--sh-sm)', transition:'all 0.18s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', marginTop:4, fontFamily:'inherit', ...style }}
    >
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>{children}</span>
    </motion.button>
  );
}

const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } };
const cardV = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:24 } } };

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
    { id:'csv',  label:'CSV',  icon:<FileSpreadsheet size={22}/>, title:'Spreadsheet Export', desc:'All accounts as a CSV. Compatible with Excel, Google Sheets, and any spreadsheet app.', meta:'Email · Password · Recovery · Level · Status · Sales · Price · Rank', color:'var(--emerald)', bg:'var(--emerald-bg)', border:'var(--emerald-b)', path:'/api/export/csv' },
    { id:'json', label:'JSON', icon:<FileJson size={22}/>, title:'Raw Data Export',    desc:'Complete records as JSON. Ideal for backups, imports, and developer tooling.',            meta:'Full document · All fields · Timestamps included',                     color:'var(--sky)', bg:'var(--sky-bg)', border:'var(--sky-b)', path:'/api/export/json' },
  ];

  return (
    <div className="fade-in" style={{ padding:'40px 24px', maxWidth:820, margin:'0 auto', minHeight:'100vh' }}>
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ width:4, height:16, borderRadius:99, background:'var(--primary)', display:'inline-block' }} />
          <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', letterSpacing:1.5, textTransform:'uppercase' }}>Data</p>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--text)', marginBottom:8, letterSpacing:'-0.5px' }}>Export Assets</h1>
        <p style={{ color:'var(--text3)', fontSize:15, marginBottom:40 }}>Download all documented asset data in your preferred format.</p>
      </motion.div>

      <motion.div variants={containerV} initial="hidden" animate="visible"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20, marginBottom:32 }}
      >
        {exports.map(ex => {
          const isLoading = downloading === ex.id;
          return (
            <motion.div key={ex.id} variants={cardV}
              whileHover={{ y:-2, boxShadow:'var(--sh-md)' }}
              style={{ background:'var(--surface)', border:`1px solid var(--border)`, borderRadius:12, padding:'24px', display:'flex', flexDirection:'column', gap:16, position:'relative', overflow:'hidden', boxShadow:'var(--sh-card)', transition:'all 0.3s ease' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:48, height:48, borderRadius:10, background:ex.bg, border:`1px solid ${ex.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:ex.color }}>
                  {ex.icon}
                </div>
                <span style={{ padding:'4px 12px', borderRadius:99, fontSize:11.5, fontWeight:600, background:ex.bg, color:ex.color, border:`1px solid ${ex.border}` }}>.{ex.label}</span>
              </div>

              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{ex.title}</div>
                <div style={{ fontSize:14, color:'var(--text3)', lineHeight:1.6 }}>{ex.desc}</div>
              </div>

              <div style={{ fontSize:12, color:'var(--text4)', background:'var(--surface2)', padding:'10px 14px', borderRadius:8, fontFamily:'var(--font-mono)', border:'1px solid var(--border-sm)' }}>{ex.meta}</div>

              <PremiumButton onClick={()=>download(ex.id,ex.path)} disabled={isLoading} color={ex.color}>
                {isLoading
                  ? <><Loader2 size={16} className="spin" /> Exporting...</>
                  : <><Download size={16}/> Download {ex.label}</>
                }
              </PremiumButton>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-b)', borderRadius:12, padding:'16px 20px', fontSize:13.5, color:'var(--amber)', display:'flex', alignItems:'flex-start', gap:12, boxShadow:'var(--sh-sm)' }}
      >
        <AlertTriangle size={18} style={{ flexShrink:0, marginTop:1 }}/>
        <span style={{ lineHeight:1.5 }}><strong>Warning:</strong> Exported files contain sensitive credentials. Store securely and never share.</span>
      </motion.div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
