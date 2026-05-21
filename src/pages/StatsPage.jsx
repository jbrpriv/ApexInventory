import React, { useState, useEffect } from 'react';
import { getOverviewStats, getLevelDist, getRecentStats } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

/* ── Dark tooltip ──────────────────────────────────────── */
const DarkTip = ({ active, payload, label, color = '#ea580c' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${color}40`,
      borderRadius: 10, padding: '8px 14px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}20`,
      fontSize: 12,
    }}>
      <p style={{ color: 'rgba(28,25,23,0.45)', marginBottom: 3, fontSize: 11 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 15 }}>{payload[0]?.value}</p>
    </div>
  );
};

/* ── Card / label styles ────────────────────────────────── */
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16, padding: '22px 24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px var(--hover-bg)',
};

const sl = {
  fontSize: 11, fontWeight: 600, color: 'rgba(28,25,23,0.45)',
  letterSpacing: 1, textTransform: 'uppercase',
  marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
};

const dot = c => (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 6px ${c}` }} />
);

/* ═══════════════════════════════════════════════════════════
   STATS PAGE
═══════════════════════════════════════════════════════════ */
export default function StatsPage() {
  const [stats,     setStats]     = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getOverviewStats(), getLevelDist(), getRecentStats()])
      .then(([s, l, r]) => {
        setStats(s.data ?? {});
        setLevelDist((l.data || []).map(d => ({ name: `Lv ${d.label}`, count: d.count })));
        setRecent((r.data || []).map(d => ({
          ...d,
          day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading stats…" />;

  const statusData = [
    { name: 'Unbanned', value: stats.unbanned || 0, fill: '#16a34a' },
    { name: 'Banned',   value: stats.banned   || 0, fill: '#e11d48' },
    { name: 'Sold',     value: stats.sold     || 0, fill: '#d97706' },
    { name: 'Unsold',   value: stats.unsold   || 0, fill: '#94a3b8' },
  ];

  const total = stats.total || 1;
  const radialData = statusData.map(d => ({
    ...d, fullMark: total,
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

  return (
    <div className="fade-in page-container" style={{ padding: '28px 20px', maxWidth: 1100, margin: '0 auto', minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 3, height: 16, borderRadius: 99, background: '#ea580c', display: 'inline-block', boxShadow: '0 0 8px rgba(234,88,12,0.5)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', letterSpacing: 2, textTransform: 'uppercase' }}>Analytics</p>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 32, letterSpacing: '-0.5px' }}>
          Statistics
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 36 }}>
        {statCards.map(s => <div key={s.label}><StatCard {...s} /></div>)}
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16 }}>

        {/* Level Distribution */}
        <motion.div whileHover={{ y: -3, boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }} style={card}>
          <div style={sl}>{dot('#a78bfa')} Level Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={levelDist} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hover-bg)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(28,25,23,0.35)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(28,25,23,0.35)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTip color="#a78bfa" />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} animationBegin={200} animationDuration={1000}>
                {levelDist.map((_, i) => (
                  <Cell key={i} fill={`hsl(${260 + i * 15}, 70%, ${55 + i * 2}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 7-Day Activity */}
        <motion.div whileHover={{ y: -3, boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }} style={card}>
          <div style={sl}>{dot('#ea580c')} Last 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={recent} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.3}  />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hover-bg)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(28,25,23,0.35)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(28,25,23,0.35)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTip color="#ea580c" />} />
              <Area type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2.5} fill="url(#statsGrad)"
                dot={{ r: 3, fill: '#ea580c', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#ea580c' }}
                animationBegin={300} animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div whileHover={{ y: -3, boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }} style={card}>
          <div style={sl}>{dot('#22c55e')} Status Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="55%" innerRadius="25%" outerRadius="85%"
              barSize={14} data={radialData} startAngle={180} endAngle={-180}
            >
              <RadialBar dataKey="value" cornerRadius={6}
                background={{ fill: 'var(--hover-bg)' }}
                animationBegin={400} animationDuration={1200}
              />
              <Tooltip
                formatter={(v, n, p) => [`${v} (${p.payload.pct}%)`, p.payload.name]}
                contentStyle={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, fontSize: 12, color: 'var(--text)',
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Legend with progress bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {statusData.map(d => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.fill, boxShadow: `0 0 6px ${d.fill}` }} />
                      <span style={{ fontSize: 12.5, color: 'rgba(28,25,23,0.55)', fontWeight: 500 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.fill }}>{d.value}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--border-sm)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
                      style={{ height: '100%', background: d.fill, borderRadius: 99, opacity: 0.8, boxShadow: `0 0 8px ${d.fill}60` }}
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
