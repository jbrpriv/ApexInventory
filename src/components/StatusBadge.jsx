import React from 'react';

const SALES_CFG = {
  Sold:   { bg: 'var(--amber-bg)',  color: 'var(--amber)',  dot: '#d97706' },
  Unsold: { bg: 'var(--slate-bg)',  color: 'var(--slate)',  dot: '#94a3b8' },
};

export function SalesBadge({ status }) {
  const c = SALES_CFG[status] || SALES_CFG.Unsold;
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

export function BanStatusBadge({ status }) {
  if (status === 'Banned') {
    return (
      <span title="Banned" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '50%',
        background: '#fef2f2', border: '2px solid #fca5a5',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    );
  }
  if (status === 'New') {
    return (
      <span title="New — unverified" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '50%',
        background: '#eff6ff', border: '2px solid #93c5fd',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="8" x2="12" y2="13"/>
          <circle cx="12" cy="16.5" r="1.2" fill="#2563eb" stroke="none"/>
        </svg>
      </span>
    );
  }
  return (
    <span title="Unbanned" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '50%',
      background: '#ecfdf5', border: '2px solid #6ee7b7',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  );
}

export default function StatusBadge({ status }) {
  if (status === 'Sold' || status === 'Unsold') return <SalesBadge status={status} />;
  return <BanStatusBadge status={status} />;
}
