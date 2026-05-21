import React from 'react';
import { motion } from 'framer-motion';
export default function EmptyState({ title, message, action }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      style={{ textAlign:'center', padding:'60px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}
    >
      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(234,88,12,0.1)', border:'1px solid rgba(234,88,12,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 0 24px rgba(234,88,12,0.15)' }}>◈</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)' }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--text4)', maxWidth:340, lineHeight:1.65 }}>{message}</div>
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </motion.div>
  );
}
