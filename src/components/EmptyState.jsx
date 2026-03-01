import React from 'react';

export default function EmptyState({ icon = '◎', title, message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, opacity: 0.2 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)' }}>{title}</div>
      {message && <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 300 }}>{message}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
