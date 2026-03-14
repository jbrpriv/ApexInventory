import React, { useEffect, useState } from 'react';

const COLOR = {
  primary:{ accent:'#4F46E5', bg:'#EEF2FF', border:'#C7D2FE' },
  green:  { accent:'#059669', bg:'#ECFDF5', border:'#6EE7B7' },
  red:    { accent:'#E11D48', bg:'#FFF1F2', border:'#FDA4AF' },
  amber:  { accent:'#D97706', bg:'#FFFBEB', border:'#FCD34D' },
  blue:   { accent:'#0284C7', bg:'#F0F9FF', border:'#7DD3FC' },
  violet: { accent:'#7C3AED', bg:'#F5F3FF', border:'#C4B5FD' },
  slate:  { accent:'#475569', bg:'#F8FAFC', border:'#CBD5E1' },
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
        borderRadius: 12, padding: '18px 16px',
        transition: 'all 0.22s', cursor: 'default',
        boxShadow: hovered ? 'var(--sh-md)' : 'var(--sh-card)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: c.accent, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{animated}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 500, marginTop: 5, letterSpacing: 0.3 }}>{label}</div>
        <div style={{ height: 2, background: c.border, borderRadius: 99, marginTop: 12, opacity: hovered ? 1 : 0, transition: 'opacity 0.22s' }} />
      </div>
    </div>
  );
}
