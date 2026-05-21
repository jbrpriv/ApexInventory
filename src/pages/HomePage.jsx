import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import UpdateModal from '../components/UpdateModal';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const LightTooltip = ({ active, payload, label, color = '#ea580c' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:`1px solid ${color}30`, borderRadius:10, padding:'8px 14px', boxShadow:`0 8px 24px var(--border)`, fontSize:12 }}>
      <p style={{ color:'var(--text3)', marginBottom:4, fontSize:11 }}>{label}</p>
      <p style={{ color, fontWeight:700, fontSize:16 }}>{payload[0]?.value}</p>
    </div>
  );
};

function AnimatedNumber({ value, color }) {
  const ref = useRef(null);
  const obj = useRef({ val: 0 });
  useEffect(() => {
    if (!value) return;
    gsap.to(obj.current, { val:value, duration:1.4, ease:'power3.out', onUpdate:()=>{ if(ref.current) ref.current.textContent=Math.round(obj.current.val); } });
  }, [value]);
  return <span ref={ref} style={{ color }}>0</span>;
}

function PremiumButton({ children, style = {}, onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled ? { y:-2, boxShadow:'0 8px 32px rgba(234,88,12,0.4)' } : {}}
      whileTap={!disabled ? { scale:0.97 } : {}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 28px', borderRadius:12, fontSize:14, fontWeight:700, background:'linear-gradient(135deg,#ea580c,#f97316)', border:'none', color:'white', cursor:'pointer', boxShadow:'0 4px 16px rgba(234,88,12,0.3)', fontFamily:'inherit', ...style }}
    >
      <motion.div initial={{x:'-100%'}} animate={{x:hovered?'200%':'-100%'}} transition={{duration:0.9}}
        style={{ position:'absolute', top:0, left:0, width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', pointerEvents:'none' }}
      />
      <span style={{ position:'relative', zIndex:1 }}>{children}</span>
    </motion.button>
  );
}

const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' };
const sl = { fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:1, textTransform:'uppercase', marginBottom:18, display:'flex', alignItems:'center', gap:8 };
const dot = c => <span style={{ width:6, height:6, borderRadius:'50%', background:c, display:'inline-block', flexShrink:0 }} />;

const chartsV = { hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } };
const chartV  = { hidden:{ opacity:0, y:28 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:240, damping:24 } } };

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [bgUrl,     setBgUrl]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    setShowUpdateModal(true);
  }, []);

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const scrollSpring = useSpring(scrollYProgress, { stiffness:100, damping:30 });

  const titleY       = useTransform(scrollSpring, [0,1], [0, -120]);
  const titleOpacity = useTransform(scrollSpring, [0,0.5], [1, 0]);
  const titleScale   = useTransform(scrollSpring, [0,0.5], [1, 0.9]);
  const cardsY       = useTransform(scrollSpring, [0,0.6], [0, 60]);
  const cardsOpacity = useTransform(scrollSpring, [0,0.55], [1, 0]);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r, bg] = await Promise.all([getOverviewStats(), getLevelDist(), getRecentStats(), getBackground()]);
      setStats(s.data ?? {});
      setLevelDist((l.data||[]).map(d=>({...d, name:`Lv ${d.label}`})));
      setRecent((r.data||[]).map(d=>({...d, day:new Date(d.date).toLocaleDateString('en',{weekday:'short'})})));
      setBgUrl(bg.data?.url||'');
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ loadAll(); }, [loadAll]);

  if (loading) return <LoadingScreen message="Loading dashboard…" />;

  const banData  = [{ name:'Unbanned', value:stats.unbanned||0, color:'#16a34a' }, { name:'Banned', value:stats.banned||0, color:'#e11d48' }];
  const saleData = [{ name:'Sold', value:stats.sold||0, color:'#d97706' }, { name:'Unsold', value:stats.unsold||0, color:'#94a3b8' }];
  const statCards = [
    { label:'Total',     value:stats.total    ||0, colorKey:'primary' },
    { label:'Unbanned',  value:stats.unbanned ||0, colorKey:'green'   },
    { label:'Banned',    value:stats.banned   ||0, colorKey:'red'     },
    { label:'Sold',      value:stats.sold     ||0, colorKey:'amber'   },
    { label:'Unsold',    value:stats.unsold   ||0, colorKey:'slate'   },
    { label:'Avg Level', value:stats.avgLevel ||0, colorKey:'violet'  },
  ];
  const heroCards = [
    { icon:'🎮', value:stats.total   ||0, label:'Total',     col:'#ea580c' },
    { icon:'✅', value:stats.unbanned||0, label:'Unbanned',  col:'#16a34a' },
    { icon:'🏪', value:stats.unsold  ||0, label:'Available', col:'#0284c7' },
  ];

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div ref={heroRef} className="hero-section" style={{
        position:'relative', height:'calc(100vh - var(--nav-h))', minHeight:520, overflow:'hidden',
        background: bgUrl
          ? `url(${bgUrl}) center/cover no-repeat`
          : 'linear-gradient(160deg, #FFF8F3 0%, #FEF3E8 40%, #FFF8F3 100%)',
      }}>
        {bgUrl && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)' }} />}

        {/* Warm ambient glows */}
        <div style={{ position:'absolute', top:'5%', left:'15%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(234,88,12,0.07),transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(249,115,22,0.05),transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />

        {/* Subtle grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px', maskImage:'radial-gradient(ellipse at center, black 30%, transparent 80%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', textAlign:'center' }}>

          {/* Badge */}
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05, duration:0.5 }}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99, background:'rgba(234,88,12,0.1)', border:'1px solid rgba(234,88,12,0.2)', marginBottom:24 }}
          >
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#ea580c', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:600, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>Apex Legends Inventory</span>
          </motion.div>

          {/* Scroll-driven title */}
          <motion.div style={{ y:titleY, opacity:titleOpacity, scale:titleScale }}>
            <motion.h1 className="hero-title"
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.15, type:'spring', stiffness:180, damping:22 }}
              style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(38px,6vw,72px)', color:bgUrl?'white':'var(--text)', lineHeight:1.05, letterSpacing:'-1.5px', marginBottom:16, maxWidth:720 }}
            >
              Welcome back,{' '}
              <span style={{ color:'transparent', backgroundClip:'text', WebkitBackgroundClip:'text', backgroundImage:'linear-gradient(135deg,#ea580c,#f97316)' }}>
                {user?.username?.toUpperCase()||'ADMIN'}
              </span>
            </motion.h1>
          </motion.div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3, duration:0.5 }}
            style={{ color:bgUrl?'rgba(255,255,255,0.7)':'var(--text3)', fontSize:14.5, letterSpacing:0.2, marginBottom:40 }}
          >
            {new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </motion.p>

          {/* CTAs + hero cards — scroll out */}
          <motion.div style={{ y:cardsY, opacity:cardsOpacity }} className="hero-float-cards"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          >
            <div style={{ display:'flex', gap:14, marginBottom:40, justifyContent:'center', flexWrap:'wrap' }}>
              <PremiumButton onClick={() => navigate('/accounts')}>View Accounts →</PremiumButton>
              <motion.button onClick={() => navigate('/stats')} whileHover={{ y:-2, borderColor:'rgba(0,0,0,0.3)' }} whileTap={{ scale:0.97 }}
                style={{ padding:'12px 28px', borderRadius:12, fontSize:14, fontWeight:700, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)', border:'1px solid var(--border-md)', color:'var(--text)', cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.2s' }}>
                View Stats
              </motion.button>
            </div>

            <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
              {heroCards.map((s,i)=>(
                <motion.div key={s.label} className="hero-float-card"
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.5+i*0.1, type:'spring', stiffness:240, damping:22 }}
                  whileHover={{ y:-5, boxShadow:`0 12px 40px var(--border-md), 0 0 0 1px ${s.col}20` }}
                  style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', border:`1px solid ${s.col}20`, borderRadius:16, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 24px var(--border)', minWidth:150, cursor:'default' }}
                >
                  <div style={{ width:38, height:38, borderRadius:10, background:`${s.col}12`, border:`1px solid ${s.col}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:700, color:s.col, lineHeight:1, fontFamily:'var(--font-display)' }}><AnimatedNumber value={s.value} color={s.col}/></div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:3, fontWeight:500 }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div animate={{ y:[0,6,0] }} transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}
          style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:3 }}
        >
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity:0.35 }}>
            <span style={{ fontSize:9, color:bgUrl?'white':'var(--text3)', letterSpacing:2.5, textTransform:'uppercase' }}>Scroll</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={bgUrl?'white':'var(--text3)'} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </motion.div>
      </div>

      {/* ── DASHBOARD ──────────────────────────────────────── */}
      <div style={{ padding:'56px 24px 80px', maxWidth:1200, margin:'0 auto' }}>

        <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
          style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:3, height:18, borderRadius:99, background:'#ea580c', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:700, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>Overview</span>
          </div>
          <div style={{ flex:1, height:1, background:'linear-gradient(to right,rgba(234,88,12,0.3),transparent)' }} />
        </motion.div>

        {/* Stat cards */}
        <motion.div className="stat-grid"
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.06 } } }}
          initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-40px' }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:44 }}
        >
          {statCards.map(s=>(
            <motion.div key={s.label} variants={{ hidden:{opacity:0,y:20,scale:0.96}, visible:{opacity:1,y:0,scale:1,transition:{type:'spring',stiffness:260,damping:22}} }}>
              <StatCard {...s}/>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div className="dashboard-grid" variants={chartsV} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-60px' }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:16 }}
        >
          <motion.div variants={chartV} whileHover={{ y:-3, boxShadow:'0 8px 32px var(--border-md)' }} style={card}>
            <div style={sl}>{dot('#16a34a')} Ban Status</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={banData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={banData[0].value>0&&banData[1].value>0?3:0} animationBegin={200} animationDuration={900}>
                {banData.map(e=><Cell key={e.name} fill={e.color}/>)}</Pie>
                <Tooltip content={<LightTooltip color="#16a34a"/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:4 }}>
              {banData.map(d=><div key={d.name} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:7, height:7, borderRadius:'50%', background:d.color }}/><span style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>{d.name}</span><span style={{ fontSize:13, fontWeight:700, color:d.color }}>{d.value}</span></div>)}
            </div>
          </motion.div>

          <motion.div variants={chartV} whileHover={{ y:-3, boxShadow:'0 8px 32px var(--border-md)' }} style={card}>
            <div style={sl}>{dot('#d97706')} Sales Status</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={saleData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={saleData[0].value>0&&saleData[1].value>0?3:0} animationBegin={300} animationDuration={900}>
                {saleData.map(e=><Cell key={e.name} fill={e.color}/>)}</Pie>
                <Tooltip content={<LightTooltip color="#d97706"/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:4 }}>
              {saleData.map(d=><div key={d.name} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:7, height:7, borderRadius:'50%', background:d.color }}/><span style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>{d.name}</span><span style={{ fontSize:13, fontWeight:700, color:d.color }}>{d.value}</span></div>)}
            </div>
          </motion.div>

          <motion.div variants={chartV} whileHover={{ y:-3, boxShadow:'0 8px 32px var(--border-md)' }} style={card}>
            <div style={sl}>{dot('#7c3aed')} Level Distribution</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={levelDist} margin={{ top:4, right:4, left:-28, bottom:0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hover-bg)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'var(--text4)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<LightTooltip color="#7c3aed"/>}/>
                <Bar dataKey="count" fill="#7c3aed" radius={[5,5,0,0]} animationBegin={400} animationDuration={1000}/>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={chartV} whileHover={{ y:-3, boxShadow:'0 8px 32px var(--border-md)' }} style={{ ...card, gridColumn:'span 2' }} data-span2>
            <div style={sl}>{dot('#ea580c')} Activity — Last 7 Days</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={recent} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <defs><linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.18}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0.01}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hover-bg)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--text4)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'var(--text4)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<LightTooltip color="#ea580c"/>}/>
                <Area type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2.5} fill="url(#actGrad)" dot={{ r:3, fill:'#ea580c', strokeWidth:0 }} activeDot={{ r:5, fill:'#ea580c' }} animationBegin={500} animationDuration={1200}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>
      {showUpdateModal && <UpdateModal onClose={handleCloseUpdate} />}
    </div>
  );
}
