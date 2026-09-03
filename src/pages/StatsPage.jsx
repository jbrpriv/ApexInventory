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

/* ── Clean tooltip ──────────────────────────────────────── */
const CleanTip = ({ active, payload, label, color = 'var(--primary)' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid var(--border-md)`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: 'var(--sh-card)', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text3)', marginBottom: 4, fontSize: 11, fontWeight:600 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16 }}>{payload[0]?.value}</p>
    </div>
  );
};

/* ── Card / label styles ────────────────────────────────── */
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16, padding: '24px',
  boxShadow: 'var(--sh-card)',
  transition: 'all 0.3s ease'
};

const sl = {
  fontSize: 11.5, fontWeight: 600, color: 'var(--text3)',
  letterSpacing: 0.5, textTransform: 'uppercase',
  marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
};

const dot = c => (
  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
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

  if (loading) return <LoadingScreen message="Loading analytics..." />;

  const statusData = [
    { name: 'Unbanned', value: stats.unbanned || 0, fill: 'var(--emerald)' },
    { name: 'Banned',   value: stats.banned   || 0, fill: 'var(--rose)' },
    { name: 'Sold',     value: stats.sold     || 0, fill: 'var(--amber)' },
    { name: 'Unsold',   value: stats.unsold   || 0, fill: 'var(--slate)' },
  ];

  const total = stats.total || 1;
  const radialData = statusData.map(d => ({
    ...d, fullMark: total,
    pct: ((d.value / total) * 100).toFixed(0),
  }));

  const statCards = [
    { label: 'Total',     value: stats.total    || 0, colorKey: 'primary' },
    { label: 'Unbanned',  value: stats.unbanned || 0, colorKey: 'emerald' },
    { label: 'Banned',    value: stats.banned   || 0, colorKey: 'rose'    },
    { label: 'Sold',      value: stats.sold     || 0, colorKey: 'amber'   },
    { label: 'Unsold',    value: stats.unsold   || 0, colorKey: 'slate'   },
    { label: 'Avg Level', value: stats.avgLevel || 0, colorKey: 'accent'  },
  ];

  return (
    <div className="fade-in page-container" style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 4, height: 16, borderRadius: 99, background: 'var(--primary)', display: 'inline-block' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Analytics</p>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 40, letterSpacing: '-0.5px' }}>
          Asset Statistics
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16, marginBottom: 48 }}>
        {statCards.map(s => <div key={s.label}><StatCard {...s} /></div>)}
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>

        {/* Level Distribution */}
        <motion.div whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }} style={card}>
          <div style={sl}>{dot('var(--accent)')} Level Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={levelDist} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sm)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<CleanTip color="var(--accent)" />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationBegin={200} animationDuration={1000} fill="var(--accent)">
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 7-Day Activity */}
        <motion.div whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }} style={card}>
          <div style={sl}>{dot('var(--primary)')} Last 7 Days</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={recent} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15}  />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-sm)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text4)', fontWeight:500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
              <Tooltip content={<CleanTip color="var(--primary)" />} />
              <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fill="url(#statsGrad)"
                dot={{ r: 4, fill: 'var(--surface)', stroke:'var(--primary)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--primary)', stroke:'var(--surface)', strokeWidth: 2 }}
                animationBegin={300} animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div whileHover={{ y: -2, boxShadow: 'var(--sh-md)' }} style={card}>
          <div style={sl}>{dot('var(--emerald)')} Status Breakdown</div>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart cx="50%" cy="55%" innerRadius="25%" outerRadius="85%"
              barSize={16} data={radialData} startAngle={180} endAngle={-180}
            >
              <RadialBar dataKey="value" cornerRadius={8}
                background={{ fill: 'var(--surface2)' }}
                animationBegin={400} animationDuration={1200}
              />
              <Tooltip
                formatter={(v, n, p) => [`${v} (${p.payload.pct}%)`, p.payload.name]}
                contentStyle={{
                  background: 'var(--surface)', border: '1px solid var(--border-md)',
                  borderRadius: 10, fontSize: 12, color: 'var(--text)', fontWeight:600, boxShadow:'var(--sh-card)'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Legend with progress bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {statusData.map(d => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                      <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: d.fill }}>{d.value}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
                      style={{ height: '100%', background: d.fill, borderRadius: 99 }}
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
