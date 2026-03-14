import React from 'react';
export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: 20,
    }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,217,255,0.1)" strokeWidth="2" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="var(--neon)" strokeWidth="2"
            strokeDasharray="30 121" strokeLinecap="round"
            style={{ animation: 'logoSpin 1s linear infinite', transformOrigin: '28px 28px' }} />
        </svg>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', animationDirection: 'reverse' }}>
          <circle cx="28" cy="28" r="16" fill="none" stroke="rgba(155,92,255,0.2)" strokeWidth="1.5" />
          <circle cx="28" cy="28" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.5"
            strokeDasharray="12 89" strokeLinecap="round"
            style={{ animation: 'logoSpin 1.5s linear infinite reverse', transformOrigin: '28px 28px' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: '18px',
          background: 'linear-gradient(135deg, var(--neon), var(--violet))',
          borderRadius: '50%', opacity: 0.8,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: 3, textTransform: 'uppercase' }}>
        {message}
      </div>
      <style>{`@keyframes logoSpin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:0.8}50%{opacity:0.3}}`}</style>
    </div>
  );
}
