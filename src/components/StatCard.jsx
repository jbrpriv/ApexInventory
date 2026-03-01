import React from 'react';

export default function StatCard({ label, value, color = 'var(--primary)', icon }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px',
      borderTop: '2px solid ' + color,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px ' + color + '22'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
