import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UPDATES = [
  {
    id: 1,
    title: "System-wide Dark Mode",
    date: "May 2026",
    description: "We've fully implemented a beautiful, sleek dark mode across the entire application! You can now seamlessly toggle between light and dark themes using the Sun/Moon icon in the top right corner of the navigation bar.",
    icon: "🌙",
    color: "#7c3aed"
  },
  {
    id: 2,
    title: "Accounts Table Cleanup",
    date: "May 2026",
    description: "We've removed the Price and Synced columns from the main accounts table to give you a cleaner view without horizontal scrolling.",
    icon: "✨",
    color: "#ea580c"
  },
  {
    id: 3,
    title: "Pending Tasks Column",
    date: "May 2026",
    description: "A new Tasks column has been added to the accounts table. We'll soon use this to highlight missing information like Apex IDs or screenshots.",
    icon: "📋",
    color: "#16a34a"
  }
];

export default function UpdateModal({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const next = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev === UPDATES.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? UPDATES.length - 1 : prev - 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const currentUpdate = UPDATES[currentIndex];

  const modal = (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <motion.div className="modal-box"
        initial={{ opacity:0, scale:0.94, y:16 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        style={{ background:'var(--surface)', borderRadius:20, width:'100%', maxWidth:680, overflow:'hidden', boxShadow:'0 24px 60px var(--border-md), 0 0 0 1px var(--border-sm)' }}
      >
        <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg,#ea580c,#f97316)', zIndex:10 }} />
        
        {/* Header */}
        <div style={{ padding:'24px 24px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#ea580c', letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>What's New</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--text)' }}>Update Details</div>
          </div>
          <button type="button" onClick={onClose}
            style={{ width:32, height:32, borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(225,29,72,0.1)';e.currentTarget.style.color='#e11d48';e.currentTarget.style.borderColor='rgba(225,29,72,0.25)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.color='var(--text3)';e.currentTarget.style.borderColor='var(--border)';}}
          >✕</button>
        </div>

        {/* Carousel Body */}
        <div style={{ position:'relative', height:280, padding:'0 24px' }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              style={{ position:'absolute', top:0, left:24, right:24, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', justifyContent:'center' }}
            >
              <div style={{ width:80, height:80, borderRadius:20, background:`${currentUpdate.color}15`, border:`1px solid ${currentUpdate.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, marginBottom:20 }}>
                {currentUpdate.icon}
              </div>
              <h3 style={{ fontSize:22, fontWeight:800, color:'var(--text)', marginBottom:12 }}>{currentUpdate.title}</h3>
              <p style={{ fontSize:15.5, color:'var(--text3)', lineHeight:1.6, maxWidth:520 }}>{currentUpdate.description}</p>
              <div style={{ fontSize:13, color:'var(--text4)', marginTop:16, fontWeight:600 }}>{currentUpdate.date}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls / Footer */}
        <div style={{ padding:'20px 24px', background:'#FAFAF9', borderTop:'1px solid var(--border-sm)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          
          <button onClick={prev} style={{ width:36, height:36, borderRadius:'50%', background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text2)', transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--hover-bg)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div style={{ display:'flex', gap:6 }}>
            {UPDATES.map((_, idx) => (
              <div key={idx} style={{ width:8, height:8, borderRadius:'50%', background: idx === currentIndex ? '#ea580c' : 'var(--border)', transition:'all 0.3s' }} />
            ))}
          </div>
          
          <button onClick={next} style={{ width:36, height:36, borderRadius:'50%', background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text2)', transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--hover-bg)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
