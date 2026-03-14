import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

function Orb({ size, top, left, color, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute', top, left,
      width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.55}px)`,
      opacity: 0.35, pointerEvents: 'none',
      animation: `orbDrift ${8 + delay}s ease-in-out ${delay}s infinite`,
    }} />
  );
}

function HeroFloatCard({ icon, value, label, color, dim, delay = 0 }) {
  return (
    <div style={{
      background: 'rgba(13,17,26,0.7)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}33`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: `float ${6 + delay}s ease-in-out ${delay}s infinite`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${dim}`,
      minWidth: 150,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: dim, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, fontFamily: 'var(--font-display)', letterSpacing: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: 'rgba(232,240,255,0.45)', marginTop: 3, fontFamily: 'var(--font-display)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
}

function DonutChart({ segments, size = 140 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.13;
  const total = segments.reduce((s, d) => s + d.value, 0);
  const circ = 2 * Math.PI * r;
  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
    </svg>
  );
  const active = segments.filter(s => s.value > 0);
  let cum = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {active.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circ * pct, gap = circ - dash;
        const offset = circ * (1 - cum);
        cum += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 6px ${seg.color}88)`, transition: `stroke-dasharray 0.8s ease ${i * 0.1}s` }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="var(--card)" />
    </svg>
  );
}

function AnimBar({ value, max, color, label }) {
  const [h, setH] = useState(0);
  useEffect(() => { const t = setTimeout(() => setH(max > 0 ? (value / max) * 100 : 0), 300); return () => clearTimeout(t); }, [value, max]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</span>
      <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{
          width: '60%', height: h + '%', minHeight: value > 0 ? 4 : 0,
          background: `linear-gradient(180deg, ${color} 0%, ${color}44 100%)`,
          borderRadius: '4px 4px 0 0', transition: 'height 0.9s cubic-bezier(.22,.68,0,1)',
          boxShadow: value > 0 ? `0 -6px 16px ${color}66` : 'none',
          position: 'relative',
        }}>
          {value > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, borderRadius: '4px 4px 0 0', boxShadow: `0 0 10px ${color}` }} />}
        </div>
      </div>
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-display)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [bgUrl, setBgUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [s, l, r, bg] = await Promise.all([getOverviewStats(), getLevelDist(), getRecentStats(), getBackground()]);
      setStats(s.data); setLevelDist(l.data); setRecent(r.data); setBgUrl(bg.data.url || '');
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  if (loading) return <LoadingScreen message="Initializing..." />;

  const maxRecent = Math.max(...recent.map(d => d.count), 1);
  const statusMax = Math.max(stats.unbanned||0, stats.banned||0, 1);
  const totalLv = levelDist.reduce((s,r) => s+r.count, 0) || 1;

  const statCards = [
    { label: 'Total',    value: stats.total    || 0, colorKey: 'primary', delay: 0.05 },
    { label: 'Unbanned', value: stats.unbanned || 0, colorKey: 'green',   delay: 0.10 },
    { label: 'Banned',   value: stats.banned   || 0, colorKey: 'red',     delay: 0.15 },
    { label: 'Sold',     value: stats.sold     || 0, colorKey: 'amber',   delay: 0.20 },
    { label: 'Unsold',   value: stats.unsold   || 0, colorKey: 'slate',   delay: 0.25 },
    { label: 'Avg Lv.',  value: stats.avgLevel || 0, colorKey: 'violet',  delay: 0.30 },
  ];

  const banSegs = [
    { label:'Unbanned', value: stats.unbanned||0, color:'#00ff88' },
    { label:'Banned',   value: stats.banned  ||0, color:'#ff3355' },
  ];
  const saleSegs = [
    { label:'Sold',   value: stats.sold  ||0, color:'#ffb800' },
    { label:'Unsold', value: stats.unsold||0, color:'rgba(122,143,166,0.6)' },
  ];

  const gridCardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--sh-card)',
    transition: 'border-color 0.25s',
  };
  const gridLabel = {
    fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 18,
    display: 'flex', alignItems: 'center', gap: 8,
  };

  return (
    <div>
      <style>{`
        @keyframes orbDrift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-40px) scale(1.08)}66%{transform:translate(-20px,20px) scale(0.94)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-12px) rotate(0.4deg)}66%{transform:translateY(-6px) rotate(-0.3deg)}}
        @keyframes heroReveal{from{opacity:0;transform:translateY(40px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes badgePop{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}
        @keyframes neonFlicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:0.6}95%{opacity:1}97%{opacity:0.8}}
        @media(max-width:900px){.hero-cards{display:none!important}}
        @media(max-width:768px){[data-span2]{grid-column:span 1!important}}
      `}</style>

      {/* ── HERO ───────────────────────────────────── */}
      <div style={{
        position: 'relative', height: 'calc(100vh - var(--nav-h))', minHeight: 580, overflow: 'hidden',
        background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'var(--void)',
      }}>
        {!bgUrl && <>
          {/* Ambient orbs */}
          <Orb size={500} top="-100px" left="-80px"   color="#00d9ff" delay={0} />
          <Orb size={400} top="30%"    left="70%"    color="#9b5cff" delay={3} />
          <Orb size={300} top="65%"    left="5%"     color="#ff006e" delay={5} />
          <Orb size={250} top="60%"    left="80%"    color="#00d9ff" delay={2} />
          {/* Hex grid */}
          <div style={{ position:'absolute', inset:0, opacity:0.04,
            backgroundImage:'linear-gradient(rgba(0,217,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,1) 1px,transparent 1px)',
            backgroundSize:'56px 56px',
          }} />
        </>}
        {/* Dark overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(7,9,15,0.4) 0%, rgba(7,9,15,0.75) 100%)' }} />

        {/* Center content */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', textAlign:'center' }}>
          
          {/* Eyebrow */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(0,217,255,0.06)', border:'1px solid rgba(0,217,255,0.2)',
            borderRadius:99, padding:'6px 18px', marginBottom:28,
            animation:'badgePop 0.6s cubic-bezier(.22,.68,0,1.2) 0.1s both',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--neon)', display:'inline-block', boxShadow:'0 0 8px var(--neon)', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'var(--neon)', fontFamily:'var(--font-display)', animation:'neonFlicker 5s ease-in-out infinite' }}>
              Apex Legends · Account Manager
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:700, lineHeight:1.0,
            fontSize:'clamp(44px,7vw,82px)', letterSpacing:'-1px', color:'var(--text)',
            textShadow:'0 0 60px rgba(0,217,255,0.2)',
            animation:'heroReveal 0.9s cubic-bezier(.22,.68,0,1.1) 0.25s both',
            marginBottom:20, maxWidth:700,
          }}>
            COMMAND<br/>
            <span style={{ background:'linear-gradient(90deg, var(--neon) 0%, var(--violet) 50%, var(--hot) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 30px rgba(0,217,255,0.5))' }}>
              YOUR ARSENAL
            </span>
          </h1>

          <p style={{ color:'rgba(232,240,255,0.45)', fontSize:15, animation:'heroReveal 0.9s cubic-bezier(.22,.68,0,1.1) 0.4s both' }}>
            {new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>

          {/* Floating stat cards */}
          <div className="hero-cards" style={{ display:'flex', gap:14, marginTop:52, flexWrap:'nowrap' }}>
            <HeroFloatCard icon="🎮" value={stats.total||0}    label="Accounts" color="var(--neon)"   dim="rgba(0,217,255,0.12)"  delay={0} />
            <HeroFloatCard icon="✅" value={stats.unbanned||0} label="Unbanned" color="var(--safe)"   dim="rgba(0,255,136,0.1)"   delay={0.5} />
            <HeroFloatCard icon="🏪" value={stats.unsold||0}   label="Available" color="var(--gold)" dim="rgba(255,184,0,0.1)"   delay={1} />
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position:'absolute', bottom:24, left:'50%', animation:'scrollBounce 2s ease-in-out infinite', zIndex:2 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity:0.3 }}>
            <span style={{ fontSize:9, color:'var(--neon)', letterSpacing:3, fontFamily:'var(--font-display)', textTransform:'uppercase' }}>Scroll</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* ── DASHBOARD ─────────────────────────────── */}
      <div style={{ padding:'48px 24px 60px', maxWidth:1200, margin:'0 auto' }}>

        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
          <div style={{ width:3, height:22, background:'linear-gradient(180deg, var(--neon), var(--violet))', borderRadius:2, boxShadow:'0 0 10px var(--neon)' }} />
          <span style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'var(--neon)' }}>Overview</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg, var(--border-md), transparent)' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:40 }}>
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Charts grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:16 }}>

          {/* Ban Status Donut */}
          <div className="card fade-up d2" style={gridCardStyle} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={gridLabel}><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--neon)',boxShadow:'0 0 6px var(--neon)',display:'inline-block' }} />Ban Status</div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <DonutChart segments={banSegs} size={130} />
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {banSegs.map(s=>(
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8,height:8,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}` }} />
                    <span style={{ fontSize:12, color:'var(--text2)', fontFamily:'var(--font-display)', letterSpacing:0.5 }}>{s.label}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:s.color, marginLeft:'auto', fontFamily:'var(--font-display)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Donut */}
          <div className="card fade-up d3" style={gridCardStyle} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={gridLabel}><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--gold)',boxShadow:'0 0 6px var(--gold)',display:'inline-block' }} />Sales</div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <DonutChart segments={saleSegs} size={130} />
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                  <span style={{ fontSize:22, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-display)', textShadow:'0 0 16px rgba(255,184,0,0.6)' }}>{stats.sold||0}</span>
                  <span style={{ fontSize:9, color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:2 }}>SOLD</span>
                </div>
              </div>
              <div style={{ flex:1 }}>
                {saleSegs.map(s=>{
                  const pct = (stats.total||0) > 0 ? (s.value/(stats.total))*100 : 0;
                  return (
                    <div key={s.label} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, color:'var(--text2)', fontFamily:'var(--font-display)', letterSpacing:0.5 }}>{s.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:s.color, fontFamily:'var(--font-display)' }}>{s.value}</span>
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:99 }}>
                        <div style={{ width:pct+'%', height:'100%', background:s.color, borderRadius:99, boxShadow:`0 0 8px ${s.color}`, transition:'width 0.8s cubic-bezier(.22,.68,0,1) 0.2s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Bars */}
          <div className="card fade-up d4" style={gridCardStyle} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={gridLabel}><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--violet)',boxShadow:'0 0 6px var(--violet)',display:'inline-block' }} />Distribution</div>
            <div style={{ height:1, background:'var(--border)', marginBottom:16 }} />
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <AnimBar value={stats.unbanned||0} max={statusMax} color="#00ff88" label="Unbanned" />
              <AnimBar value={stats.banned||0}   max={statusMax} color="#ff3355" label="Banned" />
            </div>
          </div>

          {/* Level Dist */}
          <div className="card fade-up d5" style={gridCardStyle} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={gridLabel}><span style={{ width:8,height:8,borderRadius:'50%',background:'#4d9fff',boxShadow:'0 0 6px #4d9fff',display:'inline-block' }} />Level Distribution</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {levelDist.map((r,i)=>{
                const pct = (r.count/totalLv)*100;
                return (
                  <div key={r.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:'var(--text2)', fontFamily:'var(--font-display)', letterSpacing:0.5 }}>Level {r.label}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--neon)', fontFamily:'var(--font-display)' }}>{r.count}</span>
                        <span style={{ fontSize:10, color:'var(--text3)' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.04)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:99,
                        background:`linear-gradient(90deg, var(--neon), var(--violet))`,
                        boxShadow:'0 0 8px rgba(0,217,255,0.5)',
                        transition:`width 0.8s cubic-bezier(.22,.68,0,1) ${i*0.08}s`,
                        width: pct+'%',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-day activity */}
          <div className="card fade-up d6" style={{ ...gridCardStyle, gridColumn:'span 2' }} data-span2 onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={gridLabel}><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--hot)',boxShadow:'0 0 6px var(--hot)',display:'inline-block' }} />Activity — Last 7 Days</div>
            <div style={{ height:1, background:'var(--border)', marginBottom:20 }} />
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:100 }}>
              {recent.map((d,i)=>{
                const ratio = d.count/maxRecent;
                const day = new Date(d.date).toLocaleDateString('en',{weekday:'short'});
                const h = Math.max(d.count>0?4:2, ratio*90);
                return (
                  <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    {d.count>0&&<span style={{ fontSize:11, fontWeight:700, color:'var(--neon)', fontFamily:'var(--font-display)' }}>{d.count}</span>}
                    {d.count===0&&<span style={{ fontSize:11, color:'transparent' }}>0</span>}
                    <div style={{ width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', height:80 }}>
                      <div style={{
                        width:'70%', borderRadius:'4px 4px 0 0',
                        height:h+'px',
                        background: d.count>0 ? 'linear-gradient(180deg, var(--neon), var(--violet))' : 'rgba(255,255,255,0.04)',
                        transition:`height 0.8s cubic-bezier(.22,.68,0,1) ${i*0.05}s`,
                        boxShadow: d.count>0 ? '0 -4px 12px rgba(0,217,255,0.4)' : 'none',
                        position:'relative',
                      }}>
                        {d.count>0&&<div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--neon)', boxShadow:'0 0 8px var(--neon)', borderRadius:'4px 4px 0 0' }} />}
                      </div>
                    </div>
                    <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
