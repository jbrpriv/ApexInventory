import React from 'react';

export const RANKS = ['Unranked','Bronze IV','Bronze III','Bronze II','Bronze I','Silver IV','Silver III','Silver II','Silver I','Gold IV','Gold III','Gold II','Gold I','Platinum IV','Platinum III','Platinum II','Platinum I','Diamond IV','Diamond III','Diamond II','Diamond I','Master','Predator'];
export const RANK_ORDER = Object.fromEntries(RANKS.map((r,i)=>[r,i]));

const TIER = {
  Unranked: { color:'var(--slate)',    bg:'var(--slate-bg)',    border:'var(--border)' },
  Bronze:   { color:'var(--amber)',    bg:'var(--amber-bg)',    border:'var(--amber-b)' },
  Silver:   { color:'var(--text4)',    bg:'var(--surface2)',    border:'var(--border-sm)' },
  Gold:     { color:'var(--accent)',   bg:'var(--accent-pale)', border:'var(--border-hi)' },
  Platinum: { color:'var(--sky)',      bg:'var(--sky-bg)',      border:'var(--sky-b)' },
  Diamond:  { color:'#3b82f6',         bg:'rgba(59,130,246,0.1)',border:'rgba(59,130,246,0.2)' },
  Master:   { color:'var(--violet)',   bg:'var(--violet-bg)',   border:'var(--violet-b)' },
  Predator: { color:'var(--rose)',     bg:'var(--rose-bg)',     border:'var(--rose-b)' },
};

function TierIcon({ tier }) {
  const c = TIER[tier]?.color || 'var(--text4)';
  if (tier==='Predator') return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><polygon points="12,2 19,8 22,16 12,22 2,16 5,8"/></svg>;
  if (tier==='Master')   return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9"/></svg>;
  if (tier==='Diamond')  return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><polygon points="12,2 22,9 18,22 6,22 2,9"/></svg>;
  if (tier==='Platinum') return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/></svg>;
  if (tier==='Gold')     return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier==='Silver')   return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier==='Bronze')   return <svg width="10" height="10" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  return <span style={{ fontSize:10, color:c, fontWeight:800 }}>-</span>;
}

export default function RankBadge({ rank }) {
  const r = rank || 'Unranked';
  const tier = (r==='Unranked'||r==='Master'||r==='Predator') ? r : r.split(' ')[0];
  const s = TIER[tier] || TIER.Unranked;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:99, background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:11.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:0.3 }}>
      <TierIcon tier={tier} />{r}
    </span>
  );
}
