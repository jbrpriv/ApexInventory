import React from 'react';
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:14 }}>
      <div style={{ width:36,height:36,border:'3px solid var(--border-md)',borderTop:'3px solid var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite' }}/>
      <div style={{ color:'var(--text3)', fontSize:13, fontWeight:500 }}>{message}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
