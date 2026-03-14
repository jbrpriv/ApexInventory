import React from 'react';
export default function EmptyState({ title, message, action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--primary-pale)', border:'1px solid var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'var(--primary)' }}>◈</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, color:'var(--text)' }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--text3)', maxWidth:340, lineHeight:1.65 }}>{message}</div>
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </div>
  );
}
