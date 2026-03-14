import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const accentColor = danger ? 'var(--danger)' : 'var(--neon)';
  const accentDim   = danger ? 'var(--danger-dim)' : 'var(--neon-dim)';

  const modal = (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(4,6,12,0.85)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)',
        border: `1px solid ${accentColor}44`,
        borderRadius: 16, width: '100%', maxWidth: 380,
        overflow: 'hidden',
        boxShadow: `var(--sh-card), 0 0 60px ${accentDim}`,
        animation: 'scaleIn 0.25s cubic-bezier(0.22,0.68,0,1.2) both',
      }}>
        {/* Top accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
        <div style={{ padding: '32px 28px 22px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: accentDim, border: `1.5px solid ${accentColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: 22,
            boxShadow: `0 0 20px ${accentDim}`,
          }}>
            {danger ? '🗑' : '?'}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
            color: 'var(--text)', marginBottom: 10, letterSpacing: 0.5,
          }}>{title}</div>
          <div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.65 }}>{message}</div>
        </div>
        <div style={{ padding: '0 28px 28px', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-display)', letterSpacing: 0.8, textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-md)', color: 'var(--text2)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--silver)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--font-display)', letterSpacing: 0.8, textTransform: 'uppercase',
            background: accentDim, border: `1px solid ${accentColor}55`, color: accentColor,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: `0 0 16px ${accentDim}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}22`; e.currentTarget.style.boxShadow = `0 0 30px ${accentDim}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = accentDim; e.currentTarget.style.boxShadow = `0 0 16px ${accentDim}`; }}
          >{confirmLabel}</button>
        </div>
      </div>
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
