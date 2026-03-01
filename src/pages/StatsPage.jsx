import React, { useState, useEffect } from 'react';
import { getOverviewStats, getLevelDist, getRecentStats } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

export default function StatsPage() {
  const [stats, setStats] = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverviewStats(), getLevelDist(), getRecentStats()])
      .then(([s, l, r]) => { setStats(s.data); setLevelDist(l.data); setRecent(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading stats..." />;

  const totalLevel = levelDist.reduce((s, r) => s + r.count, 0) || 1;
  const maxRecent = Math.max(...recent.map(d => d.count), 1);

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Analytics</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Statistics</h1>
      </div>

      {/* Overview — each card has its own color via colorKey */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Accounts', value: stats.total    || 0, colorKey: 'primary' },
          { label: 'Unbanned',       value: stats.unbanned || 0, colorKey: 'green'   },
          { label: 'Banned',         value: stats.banned   || 0, colorKey: 'red'     },
          { label: 'New',            value: stats.new      || 0, colorKey: 'blue'    },
          { label: 'Sold',           value: stats.sold     || 0, colorKey: 'amber'   },
          { label: 'Unsold',         value: stats.unsold   || 0, colorKey: 'slate'   },
          { label: 'Avg Level',      value: stats.avgLevel || 0, colorKey: 'violet'  },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Level Distribution */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18, fontWeight: 700 }}>Level Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {levelDist.map(r => {
              const pct = (r.count / totalLevel) * 100;
              return (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>Level {r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                      {r.count} <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 11 }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 99 }}>
                    <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--violet))', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent 7 Days */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18, fontWeight: 700 }}>Accounts Added — Last 7 Days</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
            {recent.map(d => {
              const h = Math.max(4, (d.count / maxRecent) * 96);
              const label = new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
              return (
                <div key={d.date} title={d.date + ': ' + d.count} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {d.count > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>{d.count}</span>}
                  {d.count === 0 && <span style={{ fontSize: 11, color: 'transparent' }}>0</span>}
                  <div style={{
                    width: '100%', height: h,
                    background: d.count > 0 ? 'linear-gradient(180deg, var(--primary) 0%, var(--violet) 100%)' : 'var(--bg3)',
                    borderRadius: '4px 4px 0 0', transition: 'height 0.5s',
                  }} />
                  <span style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18, fontWeight: 700 }}>Status Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Unbanned', value: stats.unbanned || 0, color: 'var(--green)' },
              { label: 'Banned',   value: stats.banned   || 0, color: 'var(--red)'   },
              { label: 'New',      value: stats.new      || 0, color: 'var(--blue)'  },
            ].map(d => {
              const pct = stats.total > 0 ? (d.value / stats.total) * 100 : 0;
              return (
                <div key={d.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 99 }}>
                    <div style={{ width: pct + '%', height: '100%', background: d.color, borderRadius: 99, opacity: 0.8, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Sales</div>
            {[
              { label: 'Sold',   value: stats.sold   || 0, color: 'var(--amber)' },
              { label: 'Unsold', value: stats.unsold || 0, color: 'var(--slate)' },
            ].map(d => {
              const pct = stats.total > 0 ? (d.value / stats.total) * 100 : 0;
              return (
                <div key={d.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 99 }}>
                    <div style={{ width: pct + '%', height: '100%', background: d.color, borderRadius: 99, opacity: 0.8, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
