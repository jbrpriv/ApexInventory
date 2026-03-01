import React from 'react';
export default function EmptyState({ title, message, action }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:10,textAlign:'center' }}>
      <div style={{ width:56,height:56,background:'var(--bg3)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:4 }}>📭</div>
      <div style={{ fontSize:16,fontWeight:700,color:'var(--text2)' }}>{title}</div>
      {message && <div style={{ fontSize:13,color:'var(--text3)',maxWidth:320,lineHeight:1.6 }}>{message}</div>}
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </div>
  );
}
