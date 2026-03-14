import React from 'react';

const RANKS = [
  { min: 650, label: 'Diamond I',   tier: 'Diamond',  numeral: 'I'   },
  { min: 600, label: 'Diamond II',  tier: 'Diamond',  numeral: 'II'  },
  { min: 550, label: 'Diamond III', tier: 'Diamond',  numeral: 'III' },
  { min: 500, label: 'Diamond IV',  tier: 'Diamond',  numeral: 'IV'  },
  { min: 450, label: 'Platinum I',  tier: 'Platinum', numeral: 'I'   },
  { min: 400, label: 'Platinum II', tier: 'Platinum', numeral: 'II'  },
  { min: 350, label: 'Platinum III',tier: 'Platinum', numeral: 'III' },
  { min: 300, label: 'Platinum IV', tier: 'Platinum', numeral: 'IV'  },
  { min: 260, label: 'Gold I',      tier: 'Gold',     numeral: 'I'   },
  { min: 220, label: 'Gold II',     tier: 'Gold',     numeral: 'II'  },
  { min: 180, label: 'Gold III',    tier: 'Gold',     numeral: 'III' },
  { min: 140, label: 'Gold IV',     tier: 'Gold',     numeral: 'IV'  },
  { min: 110, label: 'Silver I',    tier: 'Silver',   numeral: 'I'   },
  { min: 80,  label: 'Silver II',   tier: 'Silver',   numeral: 'II'  },
  { min: 50,  label: 'Silver III',  tier: 'Silver',   numeral: 'III' },
  { min: 20,  label: 'Silver IV',   tier: 'Silver',   numeral: 'IV'  },
];

const TIER_STYLES = {
  Diamond:  { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', glow: '#818cf8' },
  Platinum: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', glow: '#06b6d4' },
  Gold:     { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', glow: '#f59e0b' },
  Silver:   { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', glow: '#94a3b8' },
};

export function getRank(level) {
  for (const r of RANKS) {
    if (level >= r.min) return r;
  }
  return null; // Unranked (level < 20)
}

export default function RankBadge({ level }) {
  const rank = getRank(level);
  if (!rank) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 6,
        background: '#f1f5f9', color: '#94a3b8',
        fontSize: 11, fontWeight: 600,
        border: '1px solid #e2e8f0',
      }}>—</span>
    );
  }
  const s = TIER_STYLES[rank.tier];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 7,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 700,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap', letterSpacing: 0.2,
    }}>
      <TierIcon tier={rank.tier} color={s.glow} />
      {rank.label}
    </span>
  );
}

function TierIcon({ tier, color }) {
  if (tier === 'Diamond') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="12,2 22,9 18,22 6,22 2,9"/>
    </svg>
  );
  if (tier === 'Platinum') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color} stroke="none">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
  if (tier === 'Gold') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
  // Silver
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}
