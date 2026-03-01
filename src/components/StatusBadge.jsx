import React from 'react';

const CONFIG = {
  Unbanned: { bg: 'var(--green-dim)',  color: 'var(--green)',  dot: '#34d399' },
  Banned:   { bg: 'var(--red-dim)',    color: 'var(--red)',    dot: '#f43f5e' },
  New:      { bg: 'var(--blue-dim)',   color: 'var(--blue)',   dot: '#60a5fa' },
  Sold:     { bg: 'var(--yellow-dim)', color: 'var(--yellow)', dot: '#fbbf24' },
  Unsold:   { bg: 'rgba(148,163,184,0.1)', color: 'var(--text2)', dot: '#94a3b8' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const c = CONFIG[status] || CONFIG.Unsold;
  const padding = size === 'lg' ? '4px 14px' : '2px 10px';
  const fontSize = size === 'lg' ? 13 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      padding, borderRadius: 99, fontSize, fontWeight: 600,
      letterSpacing: 0.3, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
