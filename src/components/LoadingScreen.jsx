import React from 'react';
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:14 }}>
      <div style={{ position:'relative', width:40, height:40 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--primary-pale)', borderTop:'3px solid var(--primary)', animation:'spin 0.8s linear infinite' }} />
      </div>
      <div style={{ color:'var(--text3)', fontSize:13.5, fontWeight:500 }}>{message}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
