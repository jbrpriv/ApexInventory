import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ExportPage() {
  const { token } = useAuth();
  const base = process.env.REACT_APP_API_URL || '';
  const [downloading, setDownloading] = useState('');

  const download = (id, path) => {
    setDownloading(id);
    const a = document.createElement('a');
    a.href = base + path + '?token=' + token;
    a.click();
    setTimeout(() => setDownloading(''), 1500);
  };

  const exports = [
    { id:'csv',  label:'CSV',  title:'Spreadsheet Export', desc:'All accounts as a CSV. Compatible with Excel, Google Sheets, and any spreadsheet app.', meta:'Email · Password · Recovery · Level · Status · Sales · Price · Rank', col:'#059669', bg:'#ECFDF5', border:'#6EE7B7', btnBg:'#059669', path:'/api/export/csv' },
    { id:'json', label:'JSON', title:'Raw Data Export',    desc:'Complete records as JSON. Ideal for backups, imports, and developer tooling.',            meta:'Full document · All fields · Timestamps included',                     col:'#0284C7', bg:'#F0F9FF', border:'#7DD3FC', btnBg:'#0284C7', path:'/api/export/json' },
  ];

  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:820, margin:'0 auto' }}>
      <p style={{ fontSize:12, fontWeight:600, color:'var(--primary)', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Data</p>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'var(--text)', marginBottom:6 }}>Export Accounts</h1>
      <p style={{ color:'var(--text3)', fontSize:14, marginBottom:32 }}>Download all account data in your preferred format.</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:20 }}>
        {exports.map(ex=>{
          const isLoading=downloading===ex.id;
          return (
            <div key={ex.id} style={{ background:'white', border:`1px solid ${ex.border}`, borderRadius:14, padding:'26px 24px', boxShadow:'var(--sh-card)', display:'flex', flexDirection:'column', gap:14, transition:'all 0.22s', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--sh-md)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='var(--sh-card)';e.currentTarget.style.transform='';}}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:ex.col }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:48, height:48, borderRadius:10, background:ex.bg, border:`1px solid ${ex.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ex.col} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11.5, fontWeight:700, background:ex.bg, color:ex.col, border:`1px solid ${ex.border}` }}>.{ex.label}</span>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{ex.title}</div>
                <div style={{ fontSize:13.5, color:'var(--text3)', lineHeight:1.65 }}>{ex.desc}</div>
              </div>
              <div style={{ fontSize:12, color:'var(--text3)', background:'var(--surface2)', padding:'8px 12px', borderRadius:7, fontFamily:'var(--font-mono)' }}>{ex.meta}</div>
              <button onClick={()=>download(ex.id,ex.path)} disabled={isLoading} style={{ padding:'12px 20px', borderRadius:9, fontSize:13.5, fontWeight:600, background:isLoading?'#C7D2FE':ex.btnBg, border:'none', color:'white', cursor:isLoading?'not-allowed':'pointer', boxShadow:isLoading?'none':`0 2px 8px ${ex.col}40`, transition:'all 0.18s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4, fontFamily:'inherit' }}
                onMouseEnter={e=>{if(!isLoading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.filter='brightness(1.05)';}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.filter='';}}
              >
                {isLoading?<><svg style={{animation:'spin 0.7s linear infinite'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Exporting…</>
                  :<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download {ex.label}</>}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:10, padding:'14px 18px', fontSize:13.5, color:'#92400E', display:'flex', alignItems:'flex-start', gap:10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span><strong>Warning:</strong> Exported files contain sensitive credentials. Store securely and never share.</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
