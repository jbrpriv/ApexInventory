import React from 'react';

export function SalesBadge({ status }) {
  const sold = status === 'Sold';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 6,
      background: sold ? '#FFFBEB' : '#F8FAFC',
      color: sold ? '#92400E' : '#475569',
      border: `1px solid ${sold ? '#FCD34D' : '#E2E8F0'}`,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sold ? '#D97706' : '#94A3B8', flexShrink: 0 }} />
      {status}
    </span>
  );
}

export function BanStatusBadge({ status }) {
  const banned = status === 'Banned';
  return (
    <span title={banned ? 'Banned' : 'Unbanned'} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '50%',
      background: banned ? '#FFF1F2' : '#ECFDF5',
      border: `1.5px solid ${banned ? '#FECACA' : '#6EE7B7'}`,
    }}>
      {banned
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      }
    </span>
  );
}

export default function StatusBadge({ status }) {
  if (status === 'Sold' || status === 'Unsold') return <SalesBadge status={status} />;
  return <BanStatusBadge status={status} />;
}
