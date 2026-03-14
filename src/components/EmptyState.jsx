import React from 'react';
export default function EmptyState({ title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--neon-dim)', border: '1px solid rgba(0,217,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        boxShadow: '0 0 24px var(--neon-dim)',
      }}>◈</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text3)', maxWidth: 340, lineHeight: 1.65 }}>{message}</div>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
