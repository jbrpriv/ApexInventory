import React from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="scale-in" style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 380,
        boxShadow: 'var(--sh-xl)', overflow: 'hidden',
      }}>
        {/* Icon header */}
        <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: danger ? 'var(--red-bg)' : 'var(--primary-pale)',
            border: '2px solid ' + (danger ? 'var(--red-b)' : 'var(--primary-light)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22,
          }}>
            {danger ? '🗑' : '?'}
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ flex: 1, padding: '12px', fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: danger ? 'var(--red)' : 'var(--primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            transition: 'all 0.18s', boxShadow: danger ? '0 2px 8px rgba(220,38,38,0.3)' : '0 2px 8px var(--primary-glow)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
