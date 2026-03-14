import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverviewStats, getLevelDist, getRecentStats, getBackground } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

function Donut({ segments, size=140 }) {
  const cx=size/2, cy=size/2, r=size*0.37, sw=size*0.12;
  const total=segments.reduce((s,d)=>s+d.value,0);
  const circ=2*Math.PI*r;
  if(total===0) return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw}/></svg>;
  const active=segments.filter(s=>s.value>0);
  let cum=0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {active.map((seg,i)=>{
        const pct=seg.value/total,dash=circ*pct,gap=circ-dash,offset=circ*(1-cum);
        cum+=pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} style={{transition:`stroke-dasharray 0.7s ease ${i*0.1}s`}}/>;
      })}
      <circle cx={cx} cy={cy} r={r*0.52} fill="white"/>
    </svg>
  );
}

function AnimBar({value,max,color,label}) {
  const [h,setH]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setH(max>0?(value/max)*100:0),300);return()=>clearTimeout(t);},[value,max]);
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <span style={{fontSize:16,fontWeight:700,color,fontFamily:'var(--font-display)'}}>{value}</span>
      <div style={{width:'100%',height:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div style={{width:'60%',height:h+'%',minHeight:value>0?4:0,background:color,borderRadius:'4px 4px 0 0',transition:'height 0.9s cubic-bezier(.22,.68,0,1)',opacity:0.85}}/>
      </div>
      <span style={{fontSize:11.5,color:'var(--text3)',fontWeight:500}}>{label}</span>
    </div>
  );
}

export default function HomePage() {
  const {user}=useAuth();
  const [stats,setStats]=useState({});
  const [levelDist,setLevelDist]=useState([]);
  const [recent,setRecent]=useState([]);
  const [bgUrl,setBgUrl]=useState('');
  const [loading,setLoading]=useState(true);

  const loadAll=useCallback(async()=>{
    try{
      const[s,l,r,bg]=await Promise.all([getOverviewStats(),getLevelDist(),getRecentStats(),getBackground()]);
      setStats(s.data);setLevelDist(l.data);setRecent(r.data);setBgUrl(bg.data.url||'');
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{loadAll();},[loadAll]);
  if(loading) return <LoadingScreen message="Loading dashboard…"/>;

  const maxRecent=Math.max(...recent.map(d=>d.count),1);
  const statusMax=Math.max(stats.unbanned||0,stats.banned||0,1);
  const totalLv=levelDist.reduce((s,r)=>s+r.count,0)||1;

  const statCards=[
    {label:'Total Accounts',value:stats.total   ||0,colorKey:'primary',delay:0.05},
    {label:'Unbanned',       value:stats.unbanned||0,colorKey:'green',  delay:0.10},
    {label:'Banned',         value:stats.banned  ||0,colorKey:'red',    delay:0.15},
    {label:'Sold',           value:stats.sold    ||0,colorKey:'amber',  delay:0.20},
    {label:'Unsold',         value:stats.unsold  ||0,colorKey:'slate',  delay:0.25},
    {label:'Avg Level',      value:stats.avgLevel||0,colorKey:'violet', delay:0.30},
  ];

  const cardStyle={background:'white',border:'1px solid var(--border)',borderRadius:12,padding:'22px 24px',boxShadow:'var(--sh-card)',transition:'box-shadow 0.2s, transform 0.2s'};
  const sectionLabel={fontSize:11.5,fontWeight:600,color:'var(--text3)',letterSpacing:0.8,textTransform:'uppercase',marginBottom:18,display:'flex',alignItems:'center',gap:8};
  const dot=c=><span style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block',flexShrink:0}}/>;

  const hov=e=>{e.currentTarget.style.boxShadow='var(--sh-md)';e.currentTarget.style.transform='translateY(-2px)';};
  const hov2=e=>{e.currentTarget.style.boxShadow='var(--sh-card)';e.currentTarget.style.transform='';};

  return (
    <div>
      <style>{`
        @keyframes fadeSlide{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}
        @media(max-width:768px){[data-span2]{grid-column:span 1!important}}
      `}</style>

      {/* Hero */}
      <div style={{ position:'relative', height:'calc(100vh - var(--nav-h))', minHeight:520, overflow:'hidden', background: bgUrl?`url(${bgUrl}) center/cover no-repeat`:'linear-gradient(135deg,#EEF2FF 0%,#F0F9FF 50%,#F5F3FF 100%)' }}>
        <div style={{ position:'absolute', inset:0, background: bgUrl?'rgba(0,0,0,0.35)':'transparent' }} />

        {/* Decorative blobs — only without bg image */}
        {!bgUrl && <>
          <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,70,229,0.08),transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)', pointerEvents:'none' }}/>
        </>}

        <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', textAlign:'center' }}>
          <p style={{ fontSize:11.5, fontWeight:600, color: bgUrl?'rgba(255,255,255,0.7)':'var(--primary)', letterSpacing:3, textTransform:'uppercase', marginBottom:18, animation:'fadeSlide 0.6s ease 0.1s both' }}>
            Apex Legends Inventory
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(36px,6vw,68px)', color: bgUrl?'white':'var(--text)', lineHeight:1.0, letterSpacing:'-1px', animation:'fadeSlide 0.7s ease 0.2s both', marginBottom:16, maxWidth:700 }}>
            Welcome back,{' '}
            <span style={{ color:'var(--primary)' }}>{user?.username?.toUpperCase()||'ADMIN'}</span>
          </h1>
          <p style={{ color: bgUrl?'rgba(255,255,255,0.65)':'var(--text3)', fontSize:15.5, animation:'fadeSlide 0.7s ease 0.35s both' }}>
            {new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>

          {/* Floating stat cards */}
          <div style={{ display:'flex', gap:16, marginTop:52, flexWrap:'wrap', justifyContent:'center', animation:'fadeSlide 0.8s ease 0.5s both' }}>
            {[
              {icon:'🎮',value:stats.total||0,   label:'Total Accounts',col:'#4F46E5',d:0},
              {icon:'✅',value:stats.unbanned||0, label:'Unbanned',       col:'#059669',d:0.15},
              {icon:'🏪',value:stats.unsold||0,   label:'Available',      col:'#0284C7',d:0.3},
            ].map(s=>(
              <div key={s.label} style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.6)', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 8px 32px rgba(0,0,0,0.1)', animation:`floatCard ${6+s.d*4}s ease-in-out ${s.d}s infinite`, minWidth:150 }}>
                <div style={{ width:38, height:38, borderRadius:8, background:`${s.col}12`, border:`1px solid ${s.col}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:20, fontWeight:700, color:s.col, lineHeight:1, fontFamily:'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#6B7280', marginTop:3, fontWeight:500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:'absolute', bottom:24, left:'50%', animation:'scrollBounce 2s ease-in-out infinite', zIndex:2 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity:0.4 }}>
            <span style={{ fontSize:10, color: bgUrl?'white':'var(--text3)', letterSpacing:2, textTransform:'uppercase' }}>Scroll</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={bgUrl?'white':'var(--text3)'} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div style={{padding:'48px 24px 60px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <span style={{fontSize:11.5,fontWeight:600,color:'var(--primary)',letterSpacing:1.5,textTransform:'uppercase'}}>Overview</span>
          <div style={{flex:1,height:1,background:'var(--border)'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:40}}>
          {statCards.map(s=><StatCard key={s.label} {...s}/>)}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:16}}>
          {/* Ban Status */}
          <div style={cardStyle} onMouseEnter={hov} onMouseLeave={hov2}>
            <div style={sectionLabel}>{dot('#059669')}Ban Status</div>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <Donut segments={[{value:stats.unbanned||0,color:'#059669'},{value:stats.banned||0,color:'#E11D48'}]} size={130}/>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[{label:'Unbanned',value:stats.unbanned||0,color:'#059669'},{label:'Banned',value:stats.banned||0,color:'#E11D48'}].map(s=>(
                  <div key={s.label} style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,color:'var(--text2)',fontWeight:500}}>{s.label}</span>
                    <span style={{fontSize:14,fontWeight:700,color:s.color}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales */}
          <div style={cardStyle} onMouseEnter={hov} onMouseLeave={hov2}>
            <div style={sectionLabel}>{dot('#D97706')}Sales Status</div>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <div style={{position:'relative',flexShrink:0}}>
                <Donut segments={[{value:stats.sold||0,color:'#D97706'},{value:stats.unsold||0,color:'#CBD5E1'}]} size={130}/>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                  <span style={{fontSize:20,fontWeight:700,color:'#D97706',fontFamily:'var(--font-display)'}}>{stats.sold||0}</span>
                  <span style={{fontSize:9,color:'var(--text3)',fontWeight:600,letterSpacing:1}}>SOLD</span>
                </div>
              </div>
              <div style={{flex:1}}>
                {[{label:'Sold',value:stats.sold||0,color:'#D97706'},{label:'Unsold',value:stats.unsold||0,color:'#94A3B8'}].map(s=>{
                  const pct=(stats.total||0)>0?(s.value/stats.total)*100:0;
                  return <div key={s.label} style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:7,height:7,borderRadius:'50%',background:s.color}}/><span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{s.label}</span></div>
                      <span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.value}</span>
                    </div>
                    <div style={{height:5,background:'#F3F4F6',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',background:s.color,borderRadius:99,width:pct+'%',transition:'width 0.8s cubic-bezier(.22,.68,0,1) 0.2s'}}/></div>
                  </div>;
                })}
              </div>
            </div>
          </div>

          {/* Distribution bars */}
          <div style={cardStyle} onMouseEnter={hov} onMouseLeave={hov2}>
            <div style={sectionLabel}>{dot('#4F46E5')}Distribution</div>
            <div style={{height:1,background:'var(--border)',marginBottom:16}}/>
            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <AnimBar value={stats.unbanned||0} max={statusMax} color="#059669" label="Unbanned"/>
              <AnimBar value={stats.banned||0}   max={statusMax} color="#E11D48" label="Banned"/>
            </div>
          </div>

          {/* Level dist */}
          <div style={cardStyle} onMouseEnter={hov} onMouseLeave={hov2}>
            <div style={sectionLabel}>{dot('#0284C7')}Level Distribution</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {levelDist.map((r,i)=>{
                const pct=(r.count/totalLv)*100;
                return <div key={r.label}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>Level {r.label}</span>
                    <div style={{display:'flex',gap:8}}><span style={{fontSize:13,fontWeight:600,color:'var(--primary)'}}>{r.count}</span><span style={{fontSize:11,color:'var(--text3)'}}>{pct.toFixed(0)}%</span></div>
                  </div>
                  <div style={{height:5,background:'#F3F4F6',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',background:'linear-gradient(90deg,#4F46E5,#818CF8)',borderRadius:99,width:pct+'%',transition:`width 0.8s cubic-bezier(.22,.68,0,1) ${i*0.07}s`}}/></div>
                </div>;
              })}
            </div>
          </div>

          {/* 7-day activity */}
          <div style={{...cardStyle,gridColumn:'span 2'}} data-span2 onMouseEnter={hov} onMouseLeave={hov2}>
            <div style={sectionLabel}>{dot('#7C3AED')}Activity — Last 7 Days</div>
            <div style={{height:1,background:'var(--border)',marginBottom:20}}/>
            <div style={{display:'flex',gap:8,alignItems:'flex-end',height:100}}>
              {recent.map((d,i)=>{
                const h=Math.max(d.count>0?4:2,(d.count/maxRecent)*88);
                const day=new Date(d.date).toLocaleDateString('en',{weekday:'short'});
                return <div key={d.date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  {d.count>0&&<span style={{fontSize:11,fontWeight:600,color:'var(--primary)'}}>{d.count}</span>}
                  {d.count===0&&<span style={{fontSize:11,color:'transparent'}}>0</span>}
                  <div style={{width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'center',height:80}}>
                    <div style={{width:'70%',borderRadius:'4px 4px 0 0',height:h+'px',background:d.count>0?'linear-gradient(180deg,#4F46E5,#818CF8)':'#F3F4F6',transition:`height 0.7s cubic-bezier(.22,.68,0,1) ${i*0.05}s`}}/>
                  </div>
                  <span style={{fontSize:10,color:'var(--text3)',fontWeight:500,textTransform:'uppercase',letterSpacing:0.5}}>{day}</span>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
