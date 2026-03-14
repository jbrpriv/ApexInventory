import React from 'react';

export const RANKS = [
  'Unranked',
  'Bronze IV','Bronze III','Bronze II','Bronze I',
  'Silver IV','Silver III','Silver II','Silver I',
  'Gold IV','Gold III','Gold II','Gold I',
  'Platinum IV','Platinum III','Platinum II','Platinum I',
  'Diamond IV','Diamond III','Diamond II','Diamond I',
  'Master','Predator',
];

export const RANK_ORDER = Object.fromEntries(RANKS.map((r, i) => [r, i]));

const TIER = {
  Unranked: { color: '#6B7280', bg: '#F3F4F6',        border: '#E5E7EB' },
  Bronze:   { color: '#92400E', bg: '#FEF3C7',        border: '#FCD34D' },
  Silver:   { color: '#374151', bg: '#F3F4F6',        border: '#D1D5DB' },
  Gold:     { color: '#92400E', bg: '#FFFBEB',        border: '#FCD34D' },
  Platinum: { color: '#0E7490', bg: '#ECFEFF',        border: '#A5F3FC' },
  Diamond:  { color: '#1D4ED8', bg: '#EFF6FF',        border: '#BFDBFE' },
  Master:   { color: '#6D28D9', bg: '#F5F3FF',        border: '#DDD6FE' },
  Predator: { color: '#B91C1C', bg: '#FFF1F2',        border: '#FECACA' },
};

function TierIcon({ tier }) {
  const c = TIER[tier]?.color || '#6B7280';
  if (tier === 'Predator') return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 19,8 22,16 12,22 2,16 5,8"/></svg>;
  if (tier === 'Master')   return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9"/></svg>;
  if (tier === 'Diamond')  return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 22,9 18,22 6,22 2,9"/></svg>;
  if (tier === 'Platinum') return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/></svg>;
  if (tier === 'Gold')     return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier === 'Silver')   return <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2"><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier === 'Bronze')   return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  return <span style={{ fontSize: 9, color: c }}>—</span>;
}

export default function RankBadge({ rank }) {
  const r = rank || 'Unranked';
  const tier = (r === 'Unranked' || r === 'Master' || r === 'Predator') ? r : r.split(' ')[0];
  const s = TIER[tier] || TIER.Unranked;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      letterSpacing: 0.2,
    }}>
      <TierIcon tier={tier} />
      {r}
    </span>
  );
}
