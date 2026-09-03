import React, { useEffect, useState } from 'react';

const COLOR = {
  primary: { accent: 'var(--primary)', bg: 'var(--primary-pale)', border: 'var(--primary-glow)' },
  emerald: { accent: 'var(--emerald)', bg: 'var(--emerald-bg)',   border: 'var(--emerald-b)' },
  rose:    { accent: 'var(--rose)',    bg: 'var(--rose-bg)',      border: 'var(--rose-b)' },
  amber:   { accent: 'var(--amber)',   bg: 'var(--amber-bg)',     border: 'var(--amber-b)' },
  sky:     { accent: 'var(--sky)',     bg: 'var(--sky-bg)',       border: 'var(--sky-b)' },
  violet:  { accent: 'var(--violet)',  bg: 'var(--violet-bg)',    border: 'var(--violet-b)' },
  slate:   { accent: 'var(--slate)',   bg: 'var(--slate-bg)',     border: 'var(--slate-b)' },
  accent:  { accent: 'var(--accent)',  bg: 'var(--accent-pale)',  border: 'var(--border-hi)' },
};

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === undefined || target === null) return;
    if (target === 0) { setCount(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export default function StatCard({ label, value, colorKey = 'primary', delay = 0 }) {
  const c = COLOR[colorKey] || COLOR.primary;
  const animated = useCountUp(value);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="count-up" style={{ animationDelay: delay + 's' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? c.bg : 'var(--surface)',
        border: `1px solid ${hovered ? c.border : 'var(--border)'}`,
        borderRadius: 12, padding: '20px 16px',
        transition: 'all 0.3s ease', cursor: 'default',
        boxShadow: hovered ? 'var(--sh-md)' : 'var(--sh-card)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: hovered ? c.accent : 'var(--text)',
          lineHeight: 1, fontFamily: 'var(--font-display)',
          transition: 'color 0.3s ease'
        }}>{animated}</div>
        <div style={{
          fontSize: 11.5, color: 'var(--text3)', fontWeight: 600,
          marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase'
        }}>{label}</div>
      </div>
    </div>
  );
}
