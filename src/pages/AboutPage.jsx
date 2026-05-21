import React from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon:'🔐', title:'Secure Auth',       desc:'JWT-based authentication with bcrypt password hashing.', color:'#ea580c' },
  { icon:'◈',  title:'Account Manager',   desc:'Full CRUD — add, edit, delete and view all Apex Legends accounts.', color:'#a78bfa' },
  { icon:'⚡', title:'Apex API Sync',     desc:'Auto-sync level and rank from the Apex Legends API every 12 hours.', color:'#38bdf8' },
  { icon:'◎',  title:'Live Stats',        desc:'Real-time charts — status, sales, level distribution, daily activity.', color:'#22c55e' },
  { icon:'🖼',  title:'Custom Background', desc:'Upload a custom hero background image hosted on Cloudinary.', color:'#f59e0b' },
  { icon:'🔍', title:'Search & Filter',   desc:'Filter by ban status, sales status, and search by email.', color:'#38bdf8' },
  { icon:'📤', title:'Export',            desc:'Export all accounts to CSV or JSON with a single click.', color:'#22c55e' },
  { icon:'📱', title:'Responsive',        desc:'Fully responsive UI that works on any screen size.', color:'#a78bfa' },
];

const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } };
const itemV = { hidden:{ opacity:0, y:24 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:24 } } };

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:760, margin:'0 auto', minHeight:'100vh' }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ width:3, height:16, borderRadius:99, background:'#ea580c', display:'inline-block', boxShadow:'0 0 8px rgba(234,88,12,0.5)' }} />
          <p style={{ fontSize:11, fontWeight:700, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>About</p>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--text)', marginBottom:10, letterSpacing:'-0.5px' }}>Apex Manager</h1>
        <p style={{ color:'rgba(28,25,23,0.55)', fontSize:15, marginBottom:40, lineHeight:1.7, maxWidth:560 }}>
          A private account management system for Apex Legends accounts. Track status, manage credentials, auto-sync rank and level, and monitor sales — all in one clean dashboard.
        </p>
      </motion.div>

      {/* Features grid */}
      <motion.div variants={containerV} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-50px' }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12, marginBottom:32 }}
      >
        {FEATURES.map(f => (
          <motion.div key={f.title} variants={itemV}
            whileHover={{ y:-3, borderColor:`${f.color}40`, boxShadow:`0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${f.color}20` }}
            style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', display:'flex', gap:14, alignItems:'flex-start', cursor:'default', transition:'border-color 0.2s', position:'relative', overflow:'hidden' }}
          >
            <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:f.color, opacity:0.04, filter:'blur(20px)', pointerEvents:'none' }} />
            <div style={{ width:40, height:40, borderRadius:10, background:`${f.color}15`, border:`1px solid ${f.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{f.icon}</div>
            <div>
              <div style={{ fontSize:14.5, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'rgba(28,25,23,0.45)', lineHeight:1.55 }}>{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
        style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'22px 24px' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <span style={{ width:3, height:14, borderRadius:99, background:'#ea580c', display:'inline-block' }} />
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(28,25,23,0.45)', letterSpacing:1.5, textTransform:'uppercase' }}>Tech Stack</p>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {['React','React Router','Axios','Express.js','MongoDB','Mongoose','JWT','bcryptjs','Cloudinary','Multer','mozambiquehe.re API'].map((t,i) => (
            <motion.span key={t} initial={{ opacity:0, scale:0.88 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.04, type:'spring', stiffness:300 }}
              whileHover={{ y:-2, borderColor:'rgba(234,88,12,0.5)' }}
              style={{ background:'rgba(234,88,12,0.08)', border:'1px solid rgba(234,88,12,0.2)', color:'#fb923c', padding:'5px 13px', borderRadius:99, fontSize:12.5, fontWeight:600, cursor:'default', transition:'border-color 0.2s' }}
            >{t}</motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
