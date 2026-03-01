import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import BackgroundUpload from '../components/BackgroundUpload';
import LoadingScreen from '../components/LoadingScreen';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [bgUrl, setBgUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r, bg] = await Promise.all([
        getOverviewStats(), getLevelDist(), getRecentStats(), getBackground()
      ]);
      setStats(s.data);
      setLevelDist(l.data);
      setRecent(r.data);
      setBgUrl(bg.data.url || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  const maxRecent = Math.max(...recent.map(d => d.count), 1);
  const totalLevel = levelDist.reduce((sum, r) => sum + r.count, 0) || 1;

  const statCards = [
    { label: 'Total',    value: stats.total    || 0, color: 'var(--primary-light)' },
    { label: 'Unbanned', value: stats.unbanned || 0, color: 'var(--green)' },
    { label: 'Banned',   value: stats.banned   || 0, color: 'var(--red)' },
    { label: 'New',      value: stats.new      || 0, color: 'var(--blue)' },
    { label: 'Sold',     value: stats.sold     || 0, color: 'var(--yellow)' },
    { label: 'Unsold',   value: stats.unsold   || 0, color: 'var(--text2)' },
    { label: 'Avg Level',value: stats.avgLevel || 0, color: 'var(--cyan)' },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{
        position: 'relative', height: 260,
        background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0d0730 0%, #130a50 50%, #0a0730 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(7,7,26,0.3) 0%, rgba(7,7,26,0.9) 100%)',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{ color: 'var(--primary-light)', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', opacity: 0.8 }}>
            Apex Legends Inventory
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 800, color: '#fff', letterSpacing: 1, textAlign: 'center',
            textShadow: '0 0 40px rgba(139,92,246,0.4)',
          }}>
            Welcome back, {user?.username?.toUpperCase() || 'ADMIN'}
          </h1>
          <div style={{ color: 'var(--cyan)', fontSize: 13, opacity: 0.8 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ marginTop: 12 }}>
            <BackgroundUpload currentUrl={bgUrl} onUpdate={setBgUrl} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 20px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

          {/* Account Status Bar */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>Account Status</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 100 }}>
              {[
                { label: 'Unbanned', value: stats.unbanned || 0, color: 'var(--green)' },
                { label: 'Banned',   value: stats.banned   || 0, color: 'var(--red)' },
                { label: 'New',      value: stats.new      || 0, color: 'var(--blue)' },
              ].map(d => {
                const max = Math.max(stats.unbanned || 0, stats.banned || 0, stats.new || 0, 1);
                const h = Math.max(8, (d.value / max) * 72);
                return (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</span>
                    <div style={{
                      width: '100%', height: h,
                      background: 'linear-gradient(180deg, ' + d.color + ' 0%, ' + d.color + '44 100%)',
                      borderRadius: '4px 4px 0 0', transition: 'height 0.5s',
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Donut */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>Sales Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                {(() => {
                  const total = (stats.sold || 0) + (stats.unsold || 0);
                  const pct = total > 0 ? ((stats.sold || 0) / total) * 100 : 0;
                  const r = 30; const circ = 2 * Math.PI * r;
                  const dash = (pct / 100) * circ;
                  return (
                    <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <circle cx="40" cy="40" r={r} fill="none" stroke="#fbbf24" strokeWidth="10"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s' }} />
                    </svg>
                  );
                })()}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--yellow)', fontFamily: "'Syne', sans-serif" }}>{stats.sold || 0}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>SOLD</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ label: 'Sold', v: stats.sold || 0, c: 'var(--yellow)' }, { label: 'Unsold', v: stats.unsold || 0, c: 'var(--text3)' }].map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.c }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>{d.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: d.c }}>{d.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level Distribution */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>Level Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {levelDist.map(r => {
                const pct = (r.count / totalLevel) * 100;
                return (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)', width: 36, textAlign: 'right', flexShrink: 0 }}>{r.label}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                      <div style={{
                        width: pct + '%', height: '100%',
                        background: 'linear-gradient(90deg, var(--primary), var(--cyan))',
                        borderRadius: 99, transition: 'width 0.5s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--primary-light)', width: 22, flexShrink: 0 }}>{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>Last 7 Days</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
              {recent.map(d => {
                const h = Math.max(4, (d.count / maxRecent) * 60);
                const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {d.count > 0 && <span style={{ fontSize: 9, color: 'var(--cyan)' }}>{d.count}</span>}
                    <div style={{
                      width: '100%', height: h,
                      background: d.count > 0 ? 'linear-gradient(180deg, var(--cyan), var(--primary))' : 'rgba(255,255,255,0.06)',
                      borderRadius: '3px 3px 0 0',
                    }} />
                    <span style={{ fontSize: 9, color: 'var(--text3)' }}>{day}</span>
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
