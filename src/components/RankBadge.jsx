import React from 'react';

export const RANKS = [
  'Unranked',
  'Silver IV', 'Silver III', 'Silver II', 'Silver I',
  'Gold IV',   'Gold III',   'Gold II',   'Gold I',
  'Platinum IV','Platinum III','Platinum II','Platinum I',
  'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I',
];

const TIER_STYLES = {
  Diamond:  { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', glow: '#818cf8' },
  Platinum: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', glow: '#06b6d4' },
  Gold:     { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', glow: '#f59e0b' },
  Silver:   { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', glow: '#94a3b8' },
  Unranked: { bg: '#f1f5f9', color: '#94a3b8', border: '#e2e8f0', glow: '#cbd5e1' },
};

function TierIcon({ tier, color }) {
  if (tier === 'Diamond') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color}><polygon points="12,2 22,9 18,22 6,22 2,9"/></svg>
  );
  if (tier === 'Platinum') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="10"/></svg>
  );
  if (tier === 'Gold') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
  );
  if (tier === 'Silver') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
  );
  return <span style={{ fontSize: 9 }}>—</span>;
}

export default function RankBadge({ rank }) {
  const r = rank || 'Unranked';
  const tier = r === 'Unranked' ? 'Unranked' : r.split(' ')[0];
  const s = TIER_STYLES[tier] || TIER_STYLES.Unranked;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 7,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 700,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap', letterSpacing: 0.2,
    }}>
      <TierIcon tier={tier} color={s.glow} />
      {r}
    </span>
  );
}
