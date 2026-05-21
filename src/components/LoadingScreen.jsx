import React from 'react';
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 16,
    }}>
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(234,88,12,0.12)',
          borderTop: '3px solid #ea580c',
          animation: 'spin 0.8s linear infinite',
          boxShadow: '0 0 20px rgba(234,88,12,0.2)',
        }} />
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 13.5, fontWeight: 500 }}>{message}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
