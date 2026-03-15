import React, { useState, useEffect, useRef } from 'react';
import { getOverviewStats, getLevelDist, getRecentStats } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import { motion, useInView } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, Legend,
} from 'recharts';

/* ── Variants ────────────────────────────────────────────────────────────── */
const cardV = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: i => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24, delay: i * 0.08 },
  }),
};

/* ── Custom tooltip ──────────────────────────────────────────────────────── */
const Tip = ({ active, payload, label, color = '#4F46E5' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 9, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <p style={{ color: '#9CA3AF', marginBottom: 3 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 15 }}>{payload[0]?.value}</p>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   STATS PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function StatsPage() {
  const [stats,     setStats]     = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.01 });

  useEffect(() => {
    Promise.all([getOverviewStats(), getLevelDist(), getRecentStats()])
      .then(([s, l, r]) => {
        setStats(s.data);
        setLevelDist(l.data.map(d => ({ name: `Lv ${d.label}`, count: d.count })));
        setRecent(r.data.map(d => ({
          ...d,
          day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading stats…" />;

  /* ── Derived data for charts ─────────────────────────────────────────── */
  const statusData = [
    { name: 'Unbanned', value: stats.unbanned || 0, fill: '#059669' },
    { name: 'Banned',   value: stats.banned   || 0, fill: '#E11D48' },
    { name: 'Sold',     value: stats.sold     || 0, fill: '#D97706' },
    { name: 'Unsold',   value: stats.unsold   || 0, fill: '#94A3B8' },
  ];

  /* RadialBar needs fullMark for each entry */
  const total = stats.total || 1;
  const radialData = statusData.map(d => ({
    ...d,
    fullMark: total,
    pct: ((d.value / total) * 100).toFixed(0),
  }));

  const statCards = [
    { label: 'Total',     value: stats.total    || 0, colorKey: 'primary' },
    { label: 'Unbanned',  value: stats.unbanned || 0, colorKey: 'green'   },
    { label: 'Banned',    value: stats.banned   || 0, colorKey: 'red'     },
    { label: 'Sold',      value: stats.sold     || 0, colorKey: 'amber'   },
    { label: 'Unsold',    value: stats.unsold   || 0, colorKey: 'slate'   },
    { label: 'Avg Level', value: stats.avgLevel || 0, colorKey: 'violet'  },
  ];

  const card = {
    background: 'white', border: '1px solid var(--border)',
    borderRadius: 12, padding: '22px 24px',
    boxShadow: 'var(--sh-card)',
  };

  const sl = {
    fontSize: 11.5, fontWeight: 600, color: 'var(--text3)',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
  };

  const dot = c => <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />;

  return (
    <div ref={ref} className="fade-in page-container" style={{ padding: '28px 20px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Analytics</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 28 }}>Statistics</h1>
      </motion.div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardV} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16 }}>

        {/* ── Level Distribution — BarChart ─────────────────────────────── */}
        <motion.div
          custom={0} variants={cardV} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
          style={card}
        >
          <div style={sl}>{dot('#4F46E5')} Level Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={levelDist} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip color="#4F46E5" />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} animationBegin={200} animationDuration={1000}>
                {levelDist.map((_, i) => (
                  <Cell key={i} fill={`hsl(${240 + i * 12}, 70%, ${55 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── 7-Day Activity — AreaChart ────────────────────────────────── */}
        <motion.div
          custom={1} variants={cardV} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
          style={card}
        >
          <div style={sl}>{dot('#7C3AED')} Last 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={recent} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.2}  />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<Tip color="#7C3AED" />} />
              <Area
                type="monotone" dataKey="count"
                stroke="#7C3AED" strokeWidth={2}
                fill="url(#statsGrad)"
                dot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#7C3AED' }}
                animationBegin={300} animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Status Breakdown — RadialBarChart ────────────────────────── */}
        <motion.div
          custom={2} variants={cardV} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }}
          style={card}
        >
          <div style={sl}>{dot('#059669')} Status Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%" cy="55%"
              innerRadius="25%" outerRadius="85%"
              barSize={14}
              data={radialData}
              startAngle={180} endAngle={-180}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: '#F3F4F6' }}
                animationBegin={400}
                animationDuration={1200}
              />
              <Tooltip
                formatter={(v, n, p) => [
                  `${v} (${p.payload.pct}%)`,
                  p.payload.name,
                ]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Manual legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {statusData.map(d => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.fill }} />
                      <span style={{ fontSize: 12.5, color: 'var(--text2)', fontWeight: 500 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.fill }}>{d.value}</span>
                  </div>
                  <div style={{ height: 3, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
                      style={{ height: '100%', background: d.fill, borderRadius: 99, opacity: 0.85 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}