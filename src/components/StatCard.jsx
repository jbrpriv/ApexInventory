import React, { useEffect, useRef, useState } from 'react';

const COLOR_MAP = {
  primary:{ accent: 'var(--neon)',    dim: 'var(--neon-dim)',    glow: 'rgba(0,217,255,0.25)'  },
  green:  { accent: 'var(--safe)',    dim: 'var(--safe-dim)',    glow: 'rgba(0,255,136,0.2)'   },
  red:    { accent: 'var(--danger)',  dim: 'var(--danger-dim)',  glow: 'rgba(255,51,85,0.2)'   },
  amber:  { accent: 'var(--gold)',    dim: 'var(--gold-dim)',    glow: 'rgba(255,184,0,0.2)'   },
  blue:   { accent: '#4d9fff',        dim: 'rgba(77,159,255,0.12)', glow: 'rgba(77,159,255,0.2)' },
  violet: { accent: 'var(--violet)',  dim: 'var(--violet-dim)',  glow: 'rgba(155,92,255,0.2)'  },
  slate:  { accent: 'var(--silver)',  dim: 'var(--silver-dim)',  glow: 'rgba(122,143,166,0.2)' },
};

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export default function StatCard({ label, value, colorKey = 'primary', delay = 0 }) {
  const c = COLOR_MAP[colorKey] || COLOR_MAP.primary;
  const animated = useCountUp(value, 900);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="count-up"
      style={{ animationDelay: delay + 's' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'var(--card)',
        border: `1px solid ${hovered ? c.accent + '60' : 'var(--border)'}`,
        borderRadius: 10, padding: '18px 16px',
        transition: 'all 0.25s',
        boxShadow: hovered ? `0 0 30px ${c.glow}, var(--sh-card)` : 'var(--sh-card)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}>
        {/* Glow dot top-right */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 6, height: 6, borderRadius: '50%',
          background: c.accent,
          boxShadow: `0 0 8px ${c.accent}`,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.2s',
          animation: 'pulse 2s ease-in-out infinite',
        }} />

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: hovered ? '100%' : '0%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
          transition: 'width 0.4s ease',
          borderRadius: '0 0 10px 10px',
        }} />

        <div style={{
          fontSize: 30, fontWeight: 700, color: c.accent, lineHeight: 1,
          fontFamily: 'var(--font-display)', letterSpacing: 1,
          textShadow: hovered ? `0 0 20px ${c.accent}88` : 'none',
          transition: 'text-shadow 0.25s',
        }}>{animated}</div>
        <div style={{
          fontSize: 10, color: 'var(--text3)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1.5,
          marginTop: 6, fontFamily: 'var(--font-display)',
        }}>{label}</div>
      </div>
    </div>
  );
}
