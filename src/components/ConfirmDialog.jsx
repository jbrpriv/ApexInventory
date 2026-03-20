import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel='Delete', danger=true }) {
  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);
  return ReactDOM.createPortal(
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onCancel}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} transition={{ type:'spring', stiffness:300, damping:28 }}
        onClick={e=>e.stopPropagation()}
        style={{ background:'#FFFFFF', border:`1px solid ${danger?'rgba(244,63,94,0.3)':'rgba(234,88,12,0.3)'}`, borderRadius:20, width:'100%', maxWidth:380, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}
      >
        <div style={{ height:3, background: danger?'linear-gradient(90deg,#f43f5e,#fb7185)':'linear-gradient(90deg,#ea580c,#f97316)' }} />
        <div style={{ padding:'28px 26px 20px', textAlign:'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:danger?'rgba(244,63,94,0.12)':'rgba(234,88,12,0.12)', border:`1.5px solid ${danger?'rgba(244,63,94,0.3)':'rgba(234,88,12,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22 }}>
            {danger ? '🗑' : '?'}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'#1C1917', marginBottom:8 }}>{title}</div>
          {/* FIX: was rgba(255,255,255,0.45) — white text on white card background, now readable dark */}
          <div style={{ fontSize:14, color:'rgba(28,25,23,0.55)', lineHeight:1.65 }}>{message}</div>
        </div>
        <div style={{ padding:'0 26px 26px', display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'11px', borderRadius:10, fontSize:14, fontWeight:600, background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.1)', color:'#44403C', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.09)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0.05)'}
          >Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'11px', borderRadius:10, fontSize:14, fontWeight:700, background:danger?'#f43f5e':'#ea580c', border:'none', color:'white', cursor:'pointer', transition:'all 0.2s', boxShadow:danger?'0 2px 12px rgba(244,63,94,0.35)':'0 2px 12px rgba(234,88,12,0.35)' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.filter='brightness(1.08)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.filter='';}}
          >{confirmLabel}</button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}