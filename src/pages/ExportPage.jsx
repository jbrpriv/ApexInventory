import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ExportPage() {
  const { token } = useAuth();
  const base = process.env.REACT_APP_API_URL || '';
  const [downloading, setDownloading] = useState('');

  const download = async (id, path) => {
    setDownloading(id);
    const a = document.createElement('a');
    a.href = base + path + '?token=' + token;
    a.click();
    setTimeout(() => setDownloading(''), 1500);
  };

  const exports = [
    {
      id: 'csv',
      label: 'CSV',
      title: 'Spreadsheet Export',
      desc: 'All accounts as a CSV file. Compatible with Excel, Google Sheets, and any spreadsheet app.',
      meta: 'Email · Password · Recovery · Level · Status · Sales · Price · Rank · Created',
      color: 'var(--safe)',
      dim: 'rgba(0,255,136,0.1)',
      border: 'rgba(0,255,136,0.25)',
      glow: 'rgba(0,255,136,0.3)',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      path: '/api/export/csv',
    },
    {
      id: 'json',
      label: 'JSON',
      title: 'Raw Data Export',
      desc: 'Complete account records as JSON. Ideal for backups, imports, and developer tooling.',
      meta: 'Full document · All fields · Timestamps included',
      color: '#4d9fff',
      dim: 'rgba(77,159,255,0.1)',
      border: 'rgba(77,159,255,0.25)',
      glow: 'rgba(77,159,255,0.3)',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
        </svg>
      ),
      path: '/api/export/json',
    },
  ];

  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:820, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <div style={{ width:3, height:18, background:'linear-gradient(180deg,var(--neon),var(--violet))', borderRadius:2, boxShadow:'0 0 8px var(--neon)' }} />
          <span style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'var(--neon)' }}>Data</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(0,217,255,0.2),transparent)' }} />
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--text)', letterSpacing:2, marginBottom:6 }}>Export Accounts</h1>
        <p style={{ color:'var(--text3)', fontSize:13.5 }}>Download all account data in your preferred format</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:20 }}>
        {exports.map(ex => {
          const isLoading = downloading === ex.id;
          return (
            <div key={ex.id} style={{
              background:'var(--card)', border:`1px solid ${ex.border}`,
              borderRadius:14, padding:'28px 24px',
              boxShadow:`var(--sh-card), 0 0 30px ${ex.dim}`,
              display:'flex', flexDirection:'column', gap:16,
              transition:'all 0.25s', position:'relative', overflow:'hidden',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=ex.color; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`var(--sh-card), 0 0 50px ${ex.dim}`; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=ex.border; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`var(--sh-card), 0 0 30px ${ex.dim}`; }}
            >
              {/* Top glow line */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${ex.color}, transparent)` }} />

              {/* Icon + tag */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:52, height:52, borderRadius:10, background:ex.dim, border:`1px solid ${ex.border}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 16px ${ex.dim}` }}>
                  {ex.icon}
                </div>
                <span style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:ex.dim, color:ex.color, border:`1px solid ${ex.border}`, fontFamily:'var(--font-display)', letterSpacing:1.5, textTransform:'uppercase', boxShadow:`0 0 8px ${ex.dim}` }}>
                  .{ex.label}
                </span>
              </div>

              {/* Title & desc */}
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8, letterSpacing:1 }}>{ex.title}</div>
                <div style={{ fontSize:13.5, color:'var(--text3)', lineHeight:1.65 }}>{ex.desc}</div>
              </div>

              {/* Meta */}
              <div style={{ fontSize:11, color:'var(--text3)', background:'rgba(255,255,255,0.03)', padding:'8px 12px', borderRadius:7, border:'1px solid var(--border)', fontFamily:'var(--font-mono)', lineHeight:1.6 }}>
                {ex.meta}
              </div>

              <button onClick={()=>download(ex.id, ex.path)} disabled={isLoading} style={{
                padding:'12px 20px', borderRadius:9, fontSize:12, fontWeight:700,
                fontFamily:'var(--font-display)', letterSpacing:2, textTransform:'uppercase',
                background: isLoading ? ex.dim : 'transparent',
                border:`1.5px solid ${ex.color}`,
                color: ex.color,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : `0 0 16px ${ex.dim}`,
                transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:9, marginTop:4,
              }}
                onMouseEnter={e=>{ if(!isLoading){e.currentTarget.style.background=ex.dim;e.currentTarget.style.boxShadow=`0 0 30px ${ex.glow}`;} }}
                onMouseLeave={e=>{ if(!isLoading){e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow=`0 0 16px ${ex.dim}`;} }}
              >
                {isLoading
                  ? <><svg style={{animation:'spin 0.7s linear infinite'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Exporting...</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download {ex.label}</>
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div style={{ background:'rgba(255,184,0,0.06)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:10, padding:'14px 18px', fontSize:13, color:'rgba(255,184,0,0.8)', display:'flex', alignItems:'flex-start', gap:10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span><strong>Warning:</strong> Exported files contain sensitive credentials including passwords. Store securely and never share.</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
