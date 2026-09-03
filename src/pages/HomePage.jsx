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
import { Shield, ShieldAlert, CheckCircle, Store, Archive } from 'lucide-react';

const LightTooltip = ({ active, payload, label, color = 'var(--primary)' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface)', border:`1px solid var(--border-md)`, borderRadius:8, padding:'10px 14px', boxShadow:`var(--sh-card)`, fontSize:12 }}>
      <p style={{ color:'var(--text3)', marginBottom:4, fontSize:11, fontWeight:600 }}>{label}</p>
      <p style={{ color, fontWeight:700, fontSize:16 }}>{payload[0]?.value}</p>
    </div>
  );
};

function AnimatedNumber({ value, color }) {
  const ref = useRef(null);
  const obj = useRef({ val: 0 });
  useEffect(() => {
    if (value === undefined || value === null) return;
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
      whileHover={!disabled ? { y:-2, boxShadow:'var(--sh-md)' } : {}}
      whileTap={!disabled ? { scale:0.97 } : {}}
      style={{ position:'relative', overflow:'hidden', padding:'12px 28px', borderRadius:8, fontSize:14, fontWeight:600, background:'var(--primary)', border:'none', color:'#FFFFFF', cursor:'pointer', boxShadow:'var(--sh-sm)', fontFamily:'var(--font-display)', display:'flex', alignItems:'center', gap:8, ...style }}
    >
      <motion.div initial={{x:'-100%'}} animate={{x:hovered?'200%':'-100%'}} transition={{duration:0.6, ease:'easeInOut'}}
        style={{ position:'absolute', top:0, left:0, width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)', pointerEvents:'none' }}
      />
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>{children}</span>
    </motion.button>
  );
}

const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'24px', boxShadow:'var(--sh-card)' };
const sl = { fontSize:11.5, fontWeight:600, color:'var(--text3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:20, display:'flex', alignItems:'center', gap:8 };
const dot = c => <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block', flexShrink:0 }} />;

const chartsV = { hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } };
const chartV  = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0, transition:{ type:'spring', stiffness:240, damping:24 } } };

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const views = parseInt(localStorage.getItem('update_modal_views') || '0', 10);
    if (views < 3) {
      setShowUpdateModal(true);
      localStorage.setItem('update_modal_views', (views + 1).toString());
    }
  }, []);

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const scrollSpring = useSpring(scrollYProgress, { stiffness:100, damping:30 });

  const titleY       = useTransform(scrollSpring, [0,1], [0, -100]);
  const titleOpacity = useTransform(scrollSpring, [0,0.5], [1, 0]);
  const cardsY       = useTransform(scrollSpring, [0,0.6], [0, 60]);
  const cardsOpacity = useTransform(scrollSpring, [0,0.55], [1, 0]);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r] = await Promise.all([getOverviewStats(), getLevelDist(), getRecentStats()]);
      setStats(s.data ?? {});
      setLevelDist((l.data||[]).map(d=>({...d, name:`Lv ${d.label}`})));
      setRecent((r.data||[]).map(d=>({...d, day:new Date(d.date).toLocaleDateString('en',{weekday:'short'})})));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ loadAll(); }, [loadAll]);

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  const banData  = [{ name:'Unbanned', value:stats.unbanned||0, color:'var(--emerald)' }, { name:'Banned', value:stats.banned||0, color:'var(--rose)' }];
  const saleData = [{ name:'Sold', value:stats.sold||0, color:'var(--amber)' }, { name:'Unsold', value:stats.unsold||0, color:'var(--slate)' }];
  
  const statCards = [
    { label:'Total',     value:stats.total    ||0, colorKey:'primary' },
    { label:'Unbanned',  value:stats.unbanned ||0, colorKey:'emerald' },
    { label:'Banned',    value:stats.banned   ||0, colorKey:'rose'    },
    { label:'Sold',      value:stats.sold     ||0, colorKey:'amber'   },
    { label:'Unsold',    value:stats.unsold   ||0, colorKey:'slate'   },
    { label:'Avg Level', value:stats.avgLevel ||0, colorKey:'accent'  },
  ];
  
  const heroCards = [
    { icon:<Archive size={20}/>, value:stats.total   ||0, label:'Total Stock',  col:'var(--text2)' },
    { icon:<CheckCircle size={20}/>, value:stats.unbanned||0, label:'Good Standing', col:'var(--emerald)' },
    { icon:<Store size={20}/>, value:stats.unsold  ||0, label:'Available',    col:'var(--accent)' },
  ];

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      {/* ── HERO ──────────────────────────────────────────── */}
      <div ref={heroRef} className="hero-section" style={{
        position:'relative', height:'calc(100vh - var(--nav-h) - 40px)', minHeight:480, maxHeight:700, overflow:'hidden',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'0 24px', textAlign:'center',
      }}>
        {/* Scroll-driven title */}
        <motion.div style={{ y:titleY, opacity:titleOpacity }} className="hero-content">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:'easeOut' }}>
            <h1 className="hero-title" style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(32px, 6vw, 64px)', color:'var(--text)', lineHeight:1.1, letterSpacing:'-1px', marginBottom:20, maxWidth:800, marginInline:'auto' }}>
              Welcome back,{' '}
              <span style={{ color:'var(--primary)' }}>
                {user?.username?.toUpperCase()||'ADMIN'}
              </span>
            </h1>
            <p style={{ color:'var(--text3)', fontSize:16, letterSpacing:0.2, marginBottom:48, maxWidth:600, marginInline:'auto', lineHeight:1.5 }}>
              Here is the latest snapshot of your premium assets and inventory status for {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}.
            </p>
          </motion.div>
        </motion.div>

        {/* CTAs + hero cards */}
        <motion.div style={{ y:cardsY, opacity:cardsOpacity }} className="hero-float-cards"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6, ease:'easeOut' }}
        >
          <div style={{ display:'flex', gap:16, marginBottom:56, justifyContent:'center', flexWrap:'wrap' }}>
            <PremiumButton onClick={() => navigate('/accounts')}>View Inventory</PremiumButton>
            <motion.button onClick={() => navigate('/stats')} whileHover={{ y:-2, backgroundColor:'var(--surface2)' }} whileTap={{ scale:0.97 }}
              style={{ padding:'12px 28px', borderRadius:8, fontSize:14, fontWeight:600, background:'transparent', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', transition:'all 0.15s' }}>
              Detailed Stats
            </motion.button>
          </div>

          <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
            {heroCards.map((s,i) => (
              <motion.div key={s.label} className="hero-float-card"
                initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.1, duration:0.5 }}
                style={{ background:'var(--surface)', border:`1px solid var(--border)`, borderRadius:12, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, boxShadow:'var(--sh-card)', minWidth:200, textAlign:'left' }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color:s.col }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:24, fontWeight:700, color:'var(--text)', lineHeight:1, fontFamily:'var(--font-display)', marginBottom:4 }}><AnimatedNumber value={s.value} color="var(--text)"/></div>
                  <div style={{ fontSize:12, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── DASHBOARD ──────────────────────────────────────── */}
      <div style={{ padding:'64px 24px 100px', maxWidth:1200, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
          style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}
        >
          <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', letterSpacing:1, textTransform:'uppercase', fontFamily:'var(--font-display)' }}>Overview</h2>
          <div style={{ flex:1, height:1, background:'var(--border-sm)' }} />
        </motion.div>

        {/* Stat cards */}
        <motion.div className="stat-grid"
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.05 } } }}
          initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-40px' }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16, marginBottom:56 }}
        >
          {statCards.map(s=>(
            <motion.div key={s.label} variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.4}} }}>
              <StatCard {...s}/>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div className="dashboard-grid" variants={chartsV} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-60px' }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20 }}
        >
          <motion.div variants={chartV} whileHover={{ y:-2, boxShadow:'var(--sh-sm)' }} style={card} transition={{ duration:0.3 }}>
            <div style={sl}>{dot('var(--emerald)')} Ban Status</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={banData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} dataKey="value" paddingAngle={banData[0].value>0&&banData[1].value>0?2:0} animationBegin={200} animationDuration={900} stroke="var(--surface)" strokeWidth={2}>
                {banData.map(e=><Cell key={e.name} fill={e.color}/>)}</Pie>
                <Tooltip content={<LightTooltip color="var(--emerald)"/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:16 }}>
              {banData.map(d=><div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:8, height:8, borderRadius:'50%', background:d.color }}/><span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>{d.name}</span><span style={{ fontSize:14, fontWeight:700, color:d.color }}>{d.value}</span></div>)}
            </div>
          </motion.div>

          <motion.div variants={chartV} whileHover={{ y:-2, boxShadow:'var(--sh-sm)' }} style={card} transition={{ duration:0.3 }}>
            <div style={sl}>{dot('var(--amber)')} Sales Status</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={saleData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} dataKey="value" paddingAngle={saleData[0].value>0&&saleData[1].value>0?2:0} animationBegin={300} animationDuration={900} stroke="var(--surface)" strokeWidth={2}>
                {saleData.map(e=><Cell key={e.name} fill={e.color}/>)}</Pie>
                <Tooltip content={<LightTooltip color="var(--amber)"/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:16 }}>
              {saleData.map(d=><div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:8, height:8, borderRadius:'50%', background:d.color }}/><span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>{d.name}</span><span style={{ fontSize:14, fontWeight:700, color:d.color }}>{d.value}</span></div>)}
            </div>
          </motion.div>

          {/* Activity uses Primary (Emerald) */}
          <motion.div variants={chartV} whileHover={{ y:-2, boxShadow:'var(--sh-sm)' }} style={{ ...card, gridColumn:'span 2' }} data-span2 transition={{ duration:0.3 }}>
            <div style={sl}>{dot('var(--primary)')} Activity — Last 7 Days</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={recent} margin={{ top:8, right:0, left:-24, bottom:0 }}>
                <defs><linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sm)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10}/>
                <Tooltip content={<LightTooltip color="var(--primary)"/>}/>
                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fill="url(#actGrad)" dot={{ r:4, fill:'var(--surface)', stroke:'var(--primary)', strokeWidth:2 }} activeDot={{ r:6, fill:'var(--primary)', stroke:'var(--surface)', strokeWidth:2 }} animationBegin={500} animationDuration={1200}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Level Distribution uses Accent (Gold) */}
          <motion.div variants={chartV} whileHover={{ y:-2, boxShadow:'var(--sh-sm)' }} style={{...card, gridColumn:'span 2'}} transition={{ duration:0.3 }}>
            <div style={sl}>{dot('var(--accent)')} Level Distribution</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={levelDist} margin={{ top:8, right:0, left:-24, bottom:0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sm)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize:11, fill:'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dx={-10}/>
                <Tooltip content={<LightTooltip color="var(--accent)"/>}/>
                <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]} animationBegin={400} animationDuration={1000}/>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>
      {showUpdateModal && <UpdateModal onClose={handleCloseUpdate} />}
    </div>
  );
}
