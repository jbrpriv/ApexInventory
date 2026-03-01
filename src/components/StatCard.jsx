import React from 'react';

const COLOR_MAP = {
  green:  { bg: 'var(--green-bg)',  text: 'var(--green)',  border: 'var(--green-b)' },
  red:    { bg: 'var(--red-bg)',    text: 'var(--red)',    border: 'var(--red-b)' },
  amber:  { bg: 'var(--amber-bg)',  text: 'var(--amber)',  border: 'var(--amber-b)' },
  blue:   { bg: 'var(--blue-bg)',   text: 'var(--blue)',   border: 'var(--blue-b)' },
  violet: { bg: 'var(--violet-bg)', text: 'var(--violet)', border: 'var(--violet-b)' },
  slate:  { bg: 'var(--slate-bg)',  text: 'var(--slate)',  border: 'var(--slate-b)' },
  cyan:   { bg: 'var(--cyan-bg)',   text: 'var(--cyan)',   border: 'var(--cyan-b)'  },
  primary:{ bg: 'var(--primary-pale)', text: 'var(--primary)', border: 'var(--primary-light)' },
};

export default function StatCard({ label, value, colorKey = 'primary', icon, delay = 0 }) {
  const c = COLOR_MAP[colorKey] || COLOR_MAP.primary;
  return (
    <div className="count-up" style={{
      animationDelay: delay + 's',
      background: c.bg,
      border: '1.5px solid ' + c.border,
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 6,
      transition: 'transform 0.18s, box-shadow 0.18s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px ' + c.border + '88'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {icon && <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>}
      <div style={{
        fontSize: 32, fontWeight: 800, color: c.text, lineHeight: 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>{value}</div>
      <div style={{ fontSize: 11.5, color: c.text, fontWeight: 600, opacity: 0.7, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
