import React from 'react';

export function SalesBadge({ status }) {
  const sold = status === 'Sold';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 6,
      background: sold ? 'rgba(255,184,0,0.1)' : 'rgba(122,143,166,0.08)',
      color: sold ? 'var(--gold)' : 'var(--silver)',
      border: `1px solid ${sold ? 'rgba(255,184,0,0.3)' : 'rgba(122,143,166,0.2)'}`,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      fontFamily: 'var(--font-display)', letterSpacing: 0.8, textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sold ? 'var(--gold)' : 'var(--silver)', boxShadow: sold ? '0 0 6px var(--gold)' : 'none' }} />
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
      background: banned ? 'var(--danger-dim)' : 'var(--safe-dim)',
      border: `1.5px solid ${banned ? 'rgba(255,51,85,0.35)' : 'rgba(0,255,136,0.35)'}`,
      boxShadow: banned ? '0 0 8px rgba(255,51,85,0.2)' : '0 0 8px rgba(0,255,136,0.15)',
      transition: 'all 0.2s',
    }}>
      {banned
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      }
    </span>
  );
}

export default function StatusBadge({ status }) {
  if (status === 'Sold' || status === 'Unsold') return <SalesBadge status={status} />;
  return <BanStatusBadge status={status} />;
}
