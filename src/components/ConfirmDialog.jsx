import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  return ReactDOM.createPortal(
    <div onClick={onCancel} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white', borderRadius:18, width:'100%', maxWidth:380, overflow:'hidden', boxShadow:'var(--sh-xl)', animation:'scaleIn 0.22s cubic-bezier(.22,.68,0,1.2) both' }}>
        <div style={{ height:3, background: danger ? 'linear-gradient(90deg,#E11D48,#F43F5E)' : 'linear-gradient(90deg,#4F46E5,#818CF8)' }} />
        <div style={{ padding:'28px 26px 20px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background: danger?'#FFF1F2':'var(--primary-pale)', border:`1.5px solid ${danger?'#FECACA':'var(--primary-light)'}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:20 }}>
            {danger ? '🗑' : '?'}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--text)', marginBottom:8 }}>{title}</div>
          <div style={{ fontSize:14, color:'var(--text3)', lineHeight:1.65 }}>{message}</div>
        </div>
        <div style={{ padding:'0 26px 26px', display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'11px', borderRadius:9, fontSize:14, fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-md)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'11px', borderRadius:9, fontSize:14, fontWeight:700, background: danger?'#E11D48':'var(--primary)', border:'none', color:'white', cursor:'pointer', transition:'all 0.2s', boxShadow: danger?'0 2px 8px rgba(225,29,72,0.3)':'0 2px 8px rgba(79,70,229,0.3)' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.filter='brightness(1.05)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.filter='';}}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
