import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import { motion, useInView, useAnimation } from 'framer-motion';
import { gsap } from 'gsap';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';

/* ── Recharts custom tooltip ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, valueKey = 'count', color = '#4F46E5' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <p style={{ color: '#6B7280', marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16 }}>{payload[0]?.value}</p>
    </div>
  );
};

/* ── GSAP counter ────────────────────────────────────────────────────────── */
function AnimatedNumber({ value, color }) {
  const ref = useRef(null);
  const obj = useRef({ val: 0 });

  useEffect(() => {
    if (!value) return;
    gsap.to(obj.current, {
      val: value,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.current.val);
      },
    });
  }, [value]);

  return <span ref={ref} style={{ color }}>0</span>;
}

/* ── Framer motion variants ─────────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: i => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 26, delay: i * 0.07 },
  }),
};

const floatCard = {
  hidden: { opacity: 0, y: 20 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 22, delay: 0.4 + i * 0.12 },
  }),
};

/* ── Pie/donut custom label ─────────────────────────────────────────────── */
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const radius = outerRadius * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   HOMEPAGE
════════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth();
  const [stats,     setStats]     = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [bgUrl,     setBgUrl]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const dashRef = useRef(null);
  const inView  = useInView(dashRef, { once: true, amount: 0.01 });

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r, bg] = await Promise.all([
        getOverviewStats(), getLevelDist(), getRecentStats(), getBackground(),
      ]);
      setStats(s.data);
      setLevelDist(l.data.map(d => ({ ...d, name: `Lv ${d.label}` })));
      setRecent(r.data.map(d => ({
        ...d,
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
      })));
      setBgUrl(bg.data.url || '');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <LoadingScreen message="Loading dashboard…" />;

  /* ── Data derivations ─────────────────────────────────────────────────── */
  const banData  = [
    { name: 'Unbanned', value: stats.unbanned || 0, color: '#059669' },
    { name: 'Banned',   value: stats.banned   || 0, color: '#E11D48' },
  ];
  const saleData = [
    { name: 'Sold',   value: stats.sold   || 0, color: '#D97706' },
    { name: 'Unsold', value: stats.unsold  || 0, color: '#CBD5E1' },
  ];
  const statCards = [
    { label: 'Total',     value: stats.total    || 0, colorKey: 'primary' },
    { label: 'Unbanned',  value: stats.unbanned || 0, colorKey: 'green'   },
    { label: 'Banned',    value: stats.banned   || 0, colorKey: 'red'     },
    { label: 'Sold',      value: stats.sold     || 0, colorKey: 'amber'   },
    { label: 'Unsold',    value: stats.unsold   || 0, colorKey: 'slate'   },
    { label: 'Avg Level', value: stats.avgLevel || 0, colorKey: 'violet'  },
  ];
  const heroCards = [
    { icon: '🎮', value: stats.total    || 0, label: 'Total',     col: '#4F46E5' },
    { icon: '✅', value: stats.unbanned || 0, label: 'Unbanned',  col: '#059669' },
    { icon: '🏪', value: stats.unsold   || 0, label: 'Available', col: '#0284C7' },
  ];

  const cardStyle = {
    background: 'white', border: '1px solid var(--border)',
    borderRadius: 12, padding: '22px 24px',
    boxShadow: 'var(--sh-card)',
  };

  const sectionLabel = {
    fontSize: 11.5, fontWeight: 600, color: 'var(--text3)',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
  };

  const dot = c => (
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
  );

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="hero-section"
        style={{
          position: 'relative',
          height: 'calc(100vh - var(--nav-h))',
          minHeight: 520,
          overflow: 'hidden',
          background: bgUrl
            ? `url(${bgUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg,#EEF2FF 0%,#F0F9FF 50%,#F5F3FF 100%)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: bgUrl ? 'rgba(0,0,0,0.35)' : 'transparent' }} />

        {!bgUrl && (
          <>
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,70,229,0.08),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)', pointerEvents: 'none' }} />
          </>
        )}

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ fontSize: 11.5, fontWeight: 600, color: bgUrl ? 'rgba(255,255,255,0.7)' : 'var(--primary)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 18 }}
          >
            Apex Legends Inventory
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 22 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(36px,6vw,68px)', color: bgUrl ? 'white' : 'var(--text)', lineHeight: 1.0, letterSpacing: '-1px', marginBottom: 16, maxWidth: 700 }}
          >
            Welcome back,{' '}
            <span style={{ color: 'var(--primary)' }}>{user?.username?.toUpperCase() || 'ADMIN'}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.5 }}
            style={{ color: bgUrl ? 'rgba(255,255,255,0.65)' : 'var(--text3)', fontSize: 15.5 }}
          >
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>

          {/* Floating hero stat cards */}
          <div className="hero-float-cards" style={{ display: 'flex', gap: 16, marginTop: 52, flexWrap: 'wrap', justifyContent: 'center' }}>
            {heroCards.map((s, i) => (
              <motion.div
                key={s.label}
                className="hero-float-card"
                custom={i}
                variants={floatCard}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: 14,
                  padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  minWidth: 150,
                  cursor: 'default',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, background: `${s.col}12`, border: `1px solid ${s.col}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.col, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                    <AnimatedNumber value={s.value} color={s.col} />
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.4 }}>
            <span style={{ fontSize: 10, color: bgUrl ? 'white' : 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={bgUrl ? 'white' : 'var(--text3)'} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DASHBOARD
      ══════════════════════════════════════════════════════════════════ */}
      <div ref={dashRef} style={{ padding: '48px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--primary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Overview</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Stat cards — staggered spring entrance */}
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16 }}>

          {/* ── Ban Status Donut (Recharts PieChart) ────────────────────── */}
          <motion.div
            custom={0} variants={cardVariants}
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
            style={cardStyle}
          >
            <div style={sectionLabel}>{dot('#059669')} Ban Status</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={banData} cx="50%" cy="50%"
                  innerRadius={44} outerRadius={68}
                  dataKey="value"
                  paddingAngle={banData[0].value > 0 && banData[1].value > 0 ? 3 : 0}
                  labelLine={false}
                  label={renderCustomLabel}
                  animationBegin={200}
                  animationDuration={900}
                >
                  {banData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
              {banData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Sales Status Donut ───────────────────────────────────────── */}
          <motion.div
            custom={1} variants={cardVariants}
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
            style={cardStyle}
          >
            <div style={sectionLabel}>{dot('#D97706')} Sales Status</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={saleData} cx="50%" cy="50%"
                  innerRadius={44} outerRadius={68}
                  dataKey="value"
                  paddingAngle={saleData[0].value > 0 && saleData[1].value > 0 ? 3 : 0}
                  labelLine={false}
                  label={renderCustomLabel}
                  animationBegin={300}
                  animationDuration={900}
                >
                  {saleData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
              {saleData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Level Distribution (Recharts BarChart) ──────────────────── */}
          <motion.div
            custom={2} variants={cardVariants}
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
            style={cardStyle}
          >
            <div style={sectionLabel}>{dot('#4F46E5')} Level Distribution</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={levelDist} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip color="#4F46E5" />} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]}
                  animationBegin={400} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── 7-Day Activity (Recharts AreaChart) — full width ─────────── */}
          <motion.div
            custom={3} variants={cardVariants}
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
            style={{ ...cardStyle, gridColumn: 'span 2' }}
            data-span2
          >
            <div style={sectionLabel}>{dot('#7C3AED')} Activity — Last 7 Days</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={recent} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip color="#4F46E5" />} />
                <Area
                  type="monotone" dataKey="count"
                  stroke="#4F46E5" strokeWidth={2}
                  fill="url(#actGrad)"
                  dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#4F46E5' }}
                  animationBegin={500} animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </div>
    </div>
  );
}