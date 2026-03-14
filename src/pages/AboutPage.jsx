import React from 'react';

const FEATURES = [
  { icon:'🔐', title:'Secure Auth',       desc:'JWT-based authentication with bcrypt password hashing.' },
  { icon:'◈',  title:'Account Manager',   desc:'Full CRUD — add, edit, delete and view all Apex Legends accounts.' },
  { icon:'⚡', title:'Apex API Sync',     desc:'Auto-sync level and rank from the Apex Legends API every 12 hours.' },
  { icon:'◎',  title:'Live Stats',        desc:'Real-time charts — status, sales, level distribution, daily activity.' },
  { icon:'🖼',  title:'Custom Background', desc:'Upload a custom hero background image hosted on Cloudinary.' },
  { icon:'🔍', title:'Search & Filter',   desc:'Filter by ban status, sales status, and search by email.' },
  { icon:'📤', title:'Export',            desc:'Export all accounts to CSV or JSON with a single click.' },
  { icon:'📱', title:'Responsive',        desc:'Fully responsive UI that works on any screen size.' },
];

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:720, margin:'0 auto' }}>
      <p style={{ fontSize:12, fontWeight:600, color:'var(--primary)', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>About</p>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'var(--text)', marginBottom:10 }}>Apex Manager</h1>
      <p style={{ color:'var(--text2)', fontSize:15, marginBottom:32, lineHeight:1.7 }}>
        A private account management system for Apex Legends accounts. Track status, manage credentials, auto-sync rank and level, and monitor sales — all in one clean dashboard.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12, marginBottom:28 }}>
        {FEATURES.map(f=>(
          <div key={f.title} style={{ background:'white', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', transition:'all 0.2s', boxShadow:'var(--sh-card)' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-hi)';e.currentTarget.style.boxShadow='var(--sh-md)';e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='var(--sh-card)';e.currentTarget.style.transform='';}}>
            <span style={{ fontSize:22, flexShrink:0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize:14.5, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'var(--text3)', lineHeight:1.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:12, padding:'20px 22px', boxShadow:'var(--sh-card)' }}>
        <p style={{ fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:16 }}>Tech Stack</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {['React','React Router','Axios','Express.js','MongoDB','Mongoose','JWT','bcryptjs','Cloudinary','Multer','mozambiquehe.re API'].map(t=>(
            <span key={t} style={{ background:'var(--primary-pale)', border:'1px solid #C7D2FE', color:'var(--primary)', padding:'5px 13px', borderRadius:99, fontSize:12.5, fontWeight:500 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
