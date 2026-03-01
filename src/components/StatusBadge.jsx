import React from 'react';

const CFG = {
  Unbanned: { bg: 'var(--green-bg)',  color: 'var(--green)',  dot: '#059669' },
  Banned:   { bg: 'var(--red-bg)',    color: 'var(--red)',    dot: '#dc2626' },
  New:      { bg: 'var(--blue-bg)',   color: 'var(--blue)',   dot: '#2563eb' },
  Sold:     { bg: 'var(--amber-bg)',  color: 'var(--amber)',  dot: '#d97706' },
  Unsold:   { bg: 'var(--slate-bg)',  color: 'var(--slate)',  dot: '#94a3b8' },
};

export default function StatusBadge({ status }) {
  const c = CFG[status] || CFG.Unsold;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
