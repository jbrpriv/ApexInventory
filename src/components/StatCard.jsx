import React, { useEffect, useState } from 'react';

const COLOR = {
  primary: { accent: '#ea580c', bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.3)'  },
  green:   { accent: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'  },
  red:     { accent: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)'  },
  amber:   { accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  blue:    { accent: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.3)' },
  violet:  { accent: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)'},
  slate:   { accent: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.2)'},
};

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
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
        borderRadius: 14, padding: '18px 16px',
        transition: 'all 0.22s', cursor: 'default',
        boxShadow: hovered ? `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}` : 'var(--sh-card)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle glow blob */}
        {hovered && (
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 80, height: 80,
            borderRadius: '50%', background: c.accent, opacity: 0.06, filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          fontSize: 28, fontWeight: 700, color: c.accent,
          lineHeight: 1, fontFamily: 'var(--font-display)',
          position: 'relative', zIndex: 1,
        }}>{animated}</div>
        <div style={{
          fontSize: 11.5, color: 'var(--text3)', fontWeight: 500,
          marginTop: 5, letterSpacing: 0.3, position: 'relative', zIndex: 1,
        }}>{label}</div>
        <div style={{
          height: 2, background: c.accent, borderRadius: 99, marginTop: 12,
          opacity: hovered ? 0.5 : 0, transition: 'opacity 0.22s',
        }} />
      </div>
    </div>
  );
}
