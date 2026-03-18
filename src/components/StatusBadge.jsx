import React from 'react';

export function SalesBadge({ status }) {
  const sold = status === 'Sold';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:6,
      background: sold ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)',
      color: sold ? '#f59e0b' : '#94a3b8',
      border: `1px solid ${sold ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.2)'}`,
      fontSize:12, fontWeight:600, whiteSpace:'nowrap',
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background: sold?'#f59e0b':'#94a3b8', flexShrink:0, boxShadow: sold?'0 0 4px #f59e0b':undefined }} />
      {status}
    </span>
  );
}

export function BanStatusBadge({ status }) {
  const banned = status === 'Banned';
  return (
    <span title={banned?'Banned':'Unbanned'} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:28, height:28, borderRadius:'50%',
      background: banned ? 'rgba(244,63,94,0.12)' : 'rgba(34,197,94,0.12)',
      border: `1.5px solid ${banned ? 'rgba(244,63,94,0.3)' : 'rgba(34,197,94,0.3)'}`,
    }}>
      {banned
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      }
    </span>
  );
}

export default function StatusBadge({ status }) {
  if (status === 'Sold' || status === 'Unsold') return <SalesBadge status={status} />;
  return <BanStatusBadge status={status} />;
}
