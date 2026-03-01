import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center', padding: 20 }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 80, fontWeight: 800, color: 'var(--border)', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text2)' }}>Page Not Found</div>
      <div style={{ fontSize: 14, color: 'var(--text3)' }}>The page you're looking for doesn't exist.</div>
      <button onClick={() => navigate('/')} style={{
        marginTop: 8, padding: '10px 24px', borderRadius: 8,
        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
        border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>← Back to Home</button>
    </div>
  );
}
