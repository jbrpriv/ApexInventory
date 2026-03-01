import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const modal = (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,14,30,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff', borderRadius: 20,
          width: '100%', maxWidth: 400,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'modalIn 0.25s cubic-bezier(0.22,0.68,0,1.2) both',
        }}
      >
        {/* Icon + text */}
        <div style={{ padding: '32px 28px 22px', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: danger ? '#fef2f2' : '#eef2ff',
            border: '2px solid ' + (danger ? '#fca5a5' : '#a5b4fc'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: 24,
          }}>
            {danger ? '🗑' : '?'}
          </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 10,
          }}>{title}</div>
          <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{message}</div>
        </div>

        {/* Buttons */}
        <div style={{ padding: '0 28px 28px', display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: 9, fontSize: 14, fontWeight: 600,
              background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#64748b',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >Cancel</button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: danger
                ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                : 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: danger
                ? '0 4px 14px rgba(220,38,38,0.35)'
                : '0 4px 14px rgba(79,70,229,0.35)',
              transition: 'all 0.18s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >{confirmLabel}</button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
