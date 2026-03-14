import React from 'react';

export const RANKS = [
  'Unranked',
  'Silver IV','Silver III','Silver II','Silver I',
  'Gold IV','Gold III','Gold II','Gold I',
  'Platinum IV','Platinum III','Platinum II','Platinum I',
  'Diamond IV','Diamond III','Diamond II','Diamond I',
];

const TIER = {
  Diamond:  { color: '#a5c8ff', bg: 'rgba(79,140,255,0.1)',  border: 'rgba(79,140,255,0.3)',  glow: 'rgba(79,140,255,0.3)' },
  Platinum: { color: '#67e8f9', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.25)' },
  Gold:     { color: 'var(--gold)', bg: 'var(--gold-dim)',   border: 'rgba(255,184,0,0.3)',   glow: 'rgba(255,184,0,0.3)'  },
  Silver:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', glow: 'transparent'         },
  Unranked: { color: 'var(--text3)', bg: 'rgba(255,255,255,0.03)', border: 'var(--border)',   glow: 'transparent'         },
};

function TierIcon({ tier }) {
  const c = TIER[tier]?.color || 'var(--text3)';
  if (tier === 'Diamond') return <svg width="8" height="8" viewBox="0 0 24 24" fill={c}><polygon points="12,1 22,10 17,22 7,22 2,10"/></svg>;
  if (tier === 'Platinum') return <svg width="8" height="8" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/></svg>;
  if (tier === 'Gold') return <svg width="8" height="8" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier === 'Silver') return <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  return <span style={{ fontSize: 7, color: c }}>—</span>;
}

export default function RankBadge({ rank }) {
  const r = rank || 'Unranked';
  const tier = r === 'Unranked' ? 'Unranked' : r.split(' ')[0];
  const s = TIER[tier] || TIER.Unranked;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      fontFamily: 'var(--font-display)', letterSpacing: 0.5, textTransform: 'uppercase',
      boxShadow: s.glow !== 'transparent' ? `0 0 10px ${s.glow}` : 'none',
    }}>
      <TierIcon tier={tier} />
      {r}
    </span>
  );
}
