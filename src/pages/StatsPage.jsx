import React, { useState, useEffect } from 'react';
import { getOverviewStats, getLevelDist, getRecentStats } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

export default function StatsPage() {
  const [stats, setStats] = useState({});
  const [levelDist, setLevelDist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverviewStats(), getLevelDist(), getRecentStats()])
      .then(([s,l,r])=>{ setStats(s.data); setLevelDist(l.data); setRecent(r.data); })
      .catch(console.error).finally(()=>setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading stats..." />;

  const totalLevel = levelDist.reduce((s,r)=>s+r.count,0)||1;
  const maxRecent = Math.max(...recent.map(d=>d.count),1);

  const gridCard = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', boxShadow:'var(--sh-card)', transition:'border-color 0.25s' };
  const sectionLabel = { fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--text3)', marginBottom:18, display:'flex', alignItems:'center', gap:8 };
  const dot = (color) => <span style={{ width:7,height:7,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}`,display:'inline-block' }} />;

  return (
    <div className="fade-in" style={{ padding:'28px 20px', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <div style={{ width:3, height:18, background:'linear-gradient(180deg,var(--neon),var(--violet))', borderRadius:2, boxShadow:'0 0 8px var(--neon)' }} />
          <span style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'var(--neon)' }}>Analytics</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(0,217,255,0.2),transparent)' }} />
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--text)', letterSpacing:2 }}>Statistics</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:12, marginBottom:32 }}>
        {[
          {label:'Total',    value:stats.total   ||0, colorKey:'primary'},
          {label:'Unbanned', value:stats.unbanned||0, colorKey:'green'  },
          {label:'Banned',   value:stats.banned  ||0, colorKey:'red'    },
          {label:'Sold',     value:stats.sold    ||0, colorKey:'amber'  },
          {label:'Unsold',   value:stats.unsold  ||0, colorKey:'slate'  },
          {label:'Avg Level',value:stats.avgLevel||0, colorKey:'violet' },
        ].map(s=><StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:16 }}>

        {/* Level Distribution */}
        <div style={gridCard} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
          <div style={sectionLabel}>{dot('var(--neon)')} Level Distribution</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {levelDist.map((r,i)=>{
              const pct = (r.count/totalLevel)*100;
              return (
                <div key={r.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--text2)', fontFamily:'var(--font-display)', letterSpacing:0.5 }}>Level {r.label}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--neon)', fontFamily:'var(--font-display)' }}>{r.count}</span>
                      <span style={{ fontSize:11, color:'var(--text3)' }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,0.04)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'linear-gradient(90deg, var(--neon), var(--violet))', borderRadius:99, boxShadow:'0 0 8px rgba(0,217,255,0.5)', transition:`width 0.8s cubic-bezier(.22,.68,0,1) ${i*0.07}s`, width:pct+'%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Activity */}
        <div style={gridCard} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
          <div style={sectionLabel}>{dot('var(--hot)')} Last 7 Days</div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:120 }}>
            {recent.map((d,i)=>{
              const h = Math.max(d.count>0?4:2, (d.count/maxRecent)*100);
              const day = new Date(d.date).toLocaleDateString('en',{weekday:'short'});
              return (
                <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  {d.count>0&&<span style={{ fontSize:11, fontWeight:700, color:'var(--neon)', fontFamily:'var(--font-display)' }}>{d.count}</span>}
                  {d.count===0&&<span style={{ fontSize:11, color:'transparent' }}>0</span>}
                  <div style={{ width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', height:88 }}>
                    <div style={{ width:'72%', borderRadius:'4px 4px 0 0', height:h+'%', background: d.count>0?'linear-gradient(180deg,var(--neon),var(--violet))':'rgba(255,255,255,0.04)', transition:`height 0.7s cubic-bezier(.22,.68,0,1) ${i*0.06}s`, boxShadow:d.count>0?'0 -4px 12px rgba(0,217,255,0.4)':'none' }} />
                  </div>
                  <span style={{ fontSize:9, color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase' }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={gridCard} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,217,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
          <div style={sectionLabel}>{dot('var(--violet)')} Status Breakdown</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              {label:'Unbanned', value:stats.unbanned||0, color:'var(--safe)'},
              {label:'Banned',   value:stats.banned  ||0, color:'var(--danger)'},
              {label:'Sold',     value:stats.sold    ||0, color:'var(--gold)'},
              {label:'Unsold',   value:stats.unsold  ||0, color:'var(--silver)'},
            ].map(d=>{
              const pct = (stats.total||0)>0?(d.value/stats.total)*100:0;
              return (
                <div key={d.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:6,height:6,borderRadius:'50%',background:d.color,boxShadow:`0 0 5px ${d.color}` }} />
                      <span style={{ fontSize:12, color:'var(--text2)', fontFamily:'var(--font-display)', letterSpacing:0.5 }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:d.color, fontFamily:'var(--font-display)' }}>{d.value}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.04)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:d.color, borderRadius:99, transition:'width 0.7s cubic-bezier(.22,.68,0,1)', width:pct+'%', boxShadow:`0 0 8px ${d.color}` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
