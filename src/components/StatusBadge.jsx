import React from 'react';
import { Ban, CheckCircle, Tag, Package } from 'lucide-react';

export function SalesBadge({ status }) {
  const sold = status === 'Sold';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 10px', borderRadius:99,
      background: sold ? 'var(--amber-bg)' : 'var(--slate-bg)',
      color: sold ? 'var(--amber)' : 'var(--slate)',
      border: `1px solid ${sold ? 'var(--amber-b)' : 'var(--slate-b)'}`,
      fontSize:11.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:0.3
    }}>
      {sold ? <Tag size={12} strokeWidth={2.5}/> : <Package size={12} strokeWidth={2.5}/>}
      {status}
    </span>
  );
}

export function BanStatusBadge({ status }) {
  const banned = status === 'Banned';
  return (
    <span title={banned ? 'Banned' : 'Unbanned'} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 10px', borderRadius:99,
      background: banned ? 'var(--rose-bg)' : 'var(--emerald-bg)',
      color: banned ? 'var(--rose)' : 'var(--emerald)',
      border: `1px solid ${banned ? 'var(--rose-b)' : 'var(--emerald-b)'}`,
      fontSize:11.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:0.3
    }}>
      {banned ? <Ban size={12} strokeWidth={2.5}/> : <CheckCircle size={12} strokeWidth={2.5}/>}
      {status}
    </span>
  );
}

export default function StatusBadge({ status }) {
  if (status === 'Sold' || status === 'Unsold') return <SalesBadge status={status} />;
  return <BanStatusBadge status={status} />;
}
