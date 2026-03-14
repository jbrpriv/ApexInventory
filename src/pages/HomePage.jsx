import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

/* ── Donut Chart ─────────────────────────── */
function PieChart({ segments, size = 160 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.14;
  const total = segments.reduce((s, d) => s + d.value, 0);
  const circ = 2 * Math.PI * r;
  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
    </svg>
  );
  const active = segments.filter(s => s.value > 0);
  let cumPct = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {active.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circ * pct, gap = circ - dash;
        const offset = circ * (1 - cumPct);
        cumPct += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: `stroke-dasharray 0.6s ease ${i * 0.12}s` }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
    </svg>
  );
}

function Bar({ value, max, color, label }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const heightPct = max > 0 ? (value / max) : 0;
  const barH = animated ? Math.max(6, heightPct * 100) : 0;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{value}</span>
      <div style={{ width: '100%', height: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{
          width: '65%', height: barH + '%', minHeight: value > 0 ? 6 : 0,
          background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
          borderRadius: '6px 6px 0 0',
          transition: 'height 0.8s cubic-bezier(.22,.68,0,1)',
          boxShadow: value > 0 ? `0 -4px 12px ${color}44` : 'none',
        }} />
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function HBar({ label, value, total, color, delay = 0 }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(total > 0 ? (value / total) * 100 : 0), 300 + delay);
    return () => clearTimeout(t);
  }, [value, total, delay]);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
          <span style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 400 }}>{pct.toFixed(0)}%</span>
        </div>
      </div>
      <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 99, transition: 'width 0.9s cubic-bezier(.22,.68,0,1)' }} />
      </div>
    </div>
  );
}

/* ── Floating Orb ─────────────────────────── */
function FloatOrb({ size, top, left, color, delay = 0, blur = 60 }) {
  return (
    <div style={{
      position: 'absolute', top, left,
      width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${blur}px)`,
      opacity: 0.45, pointerEvents: 'none',
      animation: `orbFloat 8s ease-in-out ${delay}s infinite`,
    }} />
  );
}

/* ── Floating Stat Card ──────────────────── */
function FloatCard({ value, label, icon, color, bg, delay = 0 }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: 16, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: `heroFloat 6s ease-in-out ${delay}s infinite`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      minWidth: 160,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{value}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [bgUrl, setBgUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r, bg] = await Promise.all([getOverviewStats(), getLevelDist(), getRecentStats(), getBackground()]);
      setStats(s.data); setLevelDist(l.data); setRecent(r.data); setBgUrl(bg.data.url || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  const maxRecent = Math.max(...recent.map(d => d.count), 1);
  const statusMax = Math.max(stats.unbanned || 0, stats.banned || 0, stats.new || 0, 1);
  const totalLevels = levelDist.reduce((s, r) => s + r.count, 0) || 1;

  const statCards = [
    { label: 'Total Accounts', value: stats.total    || 0, colorKey: 'primary', delay: 0.05 },
    { label: 'Unbanned',       value: stats.unbanned || 0, colorKey: 'green',   delay: 0.10 },
    { label: 'Banned',         value: stats.banned   || 0, colorKey: 'red',     delay: 0.15 },
    { label: 'New',            value: stats.new      || 0, colorKey: 'blue',    delay: 0.20 },
    { label: 'Sold',           value: stats.sold     || 0, colorKey: 'amber',   delay: 0.25 },
    { label: 'Unsold',         value: stats.unsold   || 0, colorKey: 'slate',   delay: 0.30 },
    { label: 'Avg Level',      value: stats.avgLevel || 0, colorKey: 'violet',  delay: 0.35 },
  ];

  const pieSegments = [
    { label: 'Unbanned', value: stats.unbanned || 0, color: '#059669' },
    { label: 'Banned',   value: stats.banned   || 0, color: '#dc2626' },
    { label: 'New',      value: stats.new      || 0, color: '#2563eb' },
  ];
  const salesSegments = [
    { label: 'Sold',   value: stats.sold   || 0, color: '#d97706' },
    { label: 'Unsold', value: stats.unsold || 0, color: '#94a3b8' },
  ];

  return (
    <div>
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-10px) rotate(0.5deg); }
          66%       { transform: translateY(-5px) rotate(-0.3deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes heroTitle {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroBadge {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
        .hero-card-1 { animation: heroFloat 7s ease-in-out 0s infinite; }
        .hero-card-2 { animation: heroFloat 7s ease-in-out 0.8s infinite; }
        .hero-card-3 { animation: heroFloat 7s ease-in-out 1.6s infinite; }
        @media (max-width: 768px) { [data-wide="true"] { grid-column: span 1 !important; } }
        @media (max-width: 900px) { .hero-cards { display: none !important; } }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - var(--nav-h))',
        minHeight: 560,
        overflow: 'hidden',
        background: bgUrl
          ? `url(${bgUrl}) center/cover no-repeat`
          : 'linear-gradient(145deg, #0f0c29 0%, #1a1050 25%, #302b63 55%, #1c1260 80%, #0f0c29 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,40,0.3) 0%, rgba(10,8,40,0.65) 100%)' }} />

        {/* Animated orbs */}
        <FloatOrb size={380} top="-80px" left="-80px" color="#7c3aed" delay={0} blur={90} />
        <FloatOrb size={300} top="20%" left="70%" color="#4f46e5" delay={2} blur={80} />
        <FloatOrb size={250} top="60%" left="10%" color="#06b6d4" delay={4} blur={70} />
        <FloatOrb size={200} top="70%" left="80%" color="#8b5cf6" delay={1} blur={60} />

        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 760 }}>
          {/* Eyebrow badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(79,70,229,0.25)', border: '1px solid rgba(129,140,248,0.4)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 24,
            animation: 'heroBadge 0.7s cubic-bezier(.22,.68,0,1.2) 0.1s both',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a5b4fc', display: 'inline-block', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Apex Legends Inventory</span>
          </div>

          {/* Main heading */}
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 'clamp(38px,6.5vw,72px)', fontWeight: 800,
            color: 'white', lineHeight: 1.05, letterSpacing: '-1.5px',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
            marginBottom: 18,
            animation: 'heroTitle 0.8s cubic-bezier(.22,.68,0,1.1) 0.2s both',
          }}>
            Welcome back,<br />
            <span style={{ background: 'linear-gradient(90deg,#a5b4fc 0%,#c4b5fd 40%,#67e8f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.username?.toUpperCase() || 'ADMIN'}
            </span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15.5, marginBottom: 0, animation: 'heroTitle 0.8s cubic-bezier(.22,.68,0,1.1) 0.35s both' }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="hero-cards" style={{
          position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 16, zIndex: 3, flexWrap: 'nowrap',
        }}>
          <div className="hero-card-1">
            <FloatCard value={stats.total || 0} label="Total Accounts" icon="🎮" color="#a5b4fc" bg="rgba(79,70,229,0.3)" />
          </div>
          <div className="hero-card-2">
            <FloatCard value={stats.unbanned || 0} label="Unbanned" icon="✅" color="#6ee7b7" bg="rgba(5,150,105,0.3)" delay={0.8} />
          </div>
          <div className="hero-card-3">
            <FloatCard value={stats.unsold || 0} label="Available" icon="🏪" color="#fcd34d" bg="rgba(217,119,6,0.3)" delay={1.6} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', animation: 'scrollBounce 2s ease-in-out infinite', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
            <span style={{ fontSize: 10, color: 'white', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Dashboard Content ── */}
      <div style={{ padding: '48px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Stat Cards */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Overview</h2>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>Account inventory at a glance</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 14 }}>
            {statCards.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, marginTop: 36 }}>

          {/* Ban Status Pie */}
          <div className="card fade-up d2" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20 }}>Ban Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <PieChart segments={pieSegments} size={140} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pieSegments.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Pie */}
          <div className="card fade-up d3" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20 }}>Sales Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <PieChart segments={salesSegments} size={140} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{stats.sold || 0}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>SOLD</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {salesSegments.map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: ((s.value / (stats.total || 1)) * 100) + '%', height: '100%', background: s.color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(.22,.68,0,1) 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card fade-up d4" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Status Distribution</div>
            <div style={{ borderTop: '1px solid var(--border)', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Bar value={stats.unbanned || 0} max={statusMax} color="#059669" label="Unbanned" />
              <Bar value={stats.banned || 0}   max={statusMax} color="#dc2626" label="Banned" />
              <Bar value={stats.new || 0}      max={statusMax} color="#2563eb" label="New" />
            </div>
          </div>

          {/* Level Distribution */}
          <div className="card fade-up d5" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20 }}>Level Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {levelDist.map((r, i) => (
                <HBar key={r.label} label={`Level ${r.label}`} value={r.count} total={totalLevels} color="var(--primary)" delay={i * 80} />
              ))}
            </div>
          </div>

          {/* 7-Day Activity */}
          <div className="card fade-up d6" style={{ padding: '22px 24px', gridColumn: 'span 2' }} data-wide="true">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Activity — Last 7 Days</div>
            <div style={{ borderTop: '1px solid var(--border)', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120 }}>
              {recent.map((d, i) => {
                const ratio = maxRecent > 0 ? d.count / maxRecent : 0;
                const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });
                const dateStr = new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }} title={dateStr + ': ' + d.count + ' accounts'}>
                    {d.count > 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)' }}>{d.count}</span>}
                    {d.count === 0 && <span style={{ fontSize: 11.5, color: 'transparent' }}>0</span>}
                    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 90 }}>
                      <div style={{
                        width: '70%', borderRadius: '6px 6px 0 0',
                        height: Math.max(d.count > 0 ? 6 : 3, ratio * 90) + 'px',
                        background: d.count > 0 ? 'linear-gradient(180deg, var(--primary) 0%, #818cf8 100%)' : 'var(--bg3)',
                        transition: `height 0.8s cubic-bezier(.22,.68,0,1) ${i * 0.05}s`,
                        boxShadow: d.count > 0 ? '0 -3px 10px rgba(79,70,229,0.25)' : 'none',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
