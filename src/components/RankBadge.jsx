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

const TIER = {
  Diamond:  { color:'#a5c8ff', bg:'rgba(79,140,255,0.1)',   border:'rgba(79,140,255,0.3)',   glow:'rgba(79,140,255,0.3)'  },
  Platinum: { color:'#67e8f9', bg:'rgba(6,182,212,0.08)',   border:'rgba(6,182,212,0.25)',   glow:'rgba(6,182,212,0.25)'  },
  Gold:     { color:'var(--gold)', bg:'var(--gold-dim)',     border:'rgba(255,184,0,0.3)',    glow:'rgba(255,184,0,0.3)'   },
  Silver:   { color:'#94a3b8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.2)',  glow:'transparent'           },
  Bronze:   { color:'#cd7f32', bg:'rgba(205,127,50,0.1)',   border:'rgba(205,127,50,0.3)',   glow:'rgba(205,127,50,0.2)'  },
  Master:   { color:'#c084fc', bg:'rgba(192,132,252,0.1)',  border:'rgba(192,132,252,0.3)',  glow:'rgba(192,132,252,0.3)' },
  Predator: { color:'#ff3355', bg:'var(--danger-dim)',       border:'rgba(255,51,85,0.4)',    glow:'rgba(255,51,85,0.4)'   },
  Unranked: { color:'var(--text3)', bg:'rgba(255,255,255,0.03)', border:'var(--border)',     glow:'transparent'           },
};

function TierIcon({ tier }) {
  const c = TIER[tier]?.color || 'var(--text3)';
  if (tier==='Predator') return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
  if (tier==='Master')   return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9"/></svg>;
  if (tier==='Diamond')  return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 22,9 18,22 6,22 2,9"/></svg>;
  if (tier==='Platinum') return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/></svg>;
  if (tier==='Gold')     return <svg width="9" height="9" viewBox="0 0 24 24" fill={c}><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier==='Silver')   return <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  if (tier==='Bronze')   return <svg width="9" height="9" viewBox="0 0 24 24" fill={c} opacity="0.85"><polygon points="12,2 15,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3"/></svg>;
  return <span style={{ fontSize:8, color:c }}>—</span>;
}

export default function RankBadge({ rank }) {
  const r = rank || 'Unranked';
  const tier = (r==='Unranked'||r==='Master'||r==='Predator') ? r : r.split(' ')[0];
  const s = TIER[tier] || TIER.Unranked;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:6,
      background:s.bg, color:s.color,
      border:`1px solid ${s.border}`,
      fontSize:11, fontWeight:600, whiteSpace:'nowrap',
      fontFamily:'var(--font-display)', letterSpacing:0.5, textTransform:'uppercase',
      boxShadow: s.glow!=='transparent' ? `0 0 10px ${s.glow}` : 'none',
    }}>
      <TierIcon tier={tier} />
      {r}
    </span>
  );
}
