import React, { useState, useEffect } from 'react';
import { getOverviewStats, getLevelDist, getRecentStats } from '../api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';

export default function StatsPage() {
  const [stats,setStats]=useState({});
  const [levelDist,setLevelDist]=useState([]);
  const [recent,setRecent]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([getOverviewStats(),getLevelDist(),getRecentStats()])
      .then(([s,l,r])=>{setStats(s.data);setLevelDist(l.data);setRecent(r.data);})
      .catch(console.error).finally(()=>setLoading(false));
  },[]);

  if(loading) return <LoadingScreen message="Loading stats…"/>;
  const totalLevel=levelDist.reduce((s,r)=>s+r.count,0)||1;
  const maxRecent=Math.max(...recent.map(d=>d.count),1);
  const card={background:'white',border:'1px solid var(--border)',borderRadius:12,padding:'22px 24px',boxShadow:'var(--sh-card)',transition:'box-shadow 0.2s,transform 0.2s'};
  const sl={fontSize:11.5,fontWeight:600,color:'var(--text3)',letterSpacing:0.8,textTransform:'uppercase',marginBottom:18,display:'flex',alignItems:'center',gap:8};
  const dot=c=><span style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block'}}/>;
  const hov=e=>{e.currentTarget.style.boxShadow='var(--sh-md)';e.currentTarget.style.transform='translateY(-2px)';};
  const ho2=e=>{e.currentTarget.style.boxShadow='var(--sh-card)';e.currentTarget.style.transform='';};

  return (
    <div className="fade-in" style={{padding:'28px 20px',maxWidth:1100,margin:'0 auto'}}>
      <p style={{fontSize:12,fontWeight:600,color:'var(--primary)',letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>Analytics</p>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:700,color:'var(--text)',marginBottom:28}}>Statistics</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12,marginBottom:32}}>
        {[{label:'Total',value:stats.total||0,colorKey:'primary'},{label:'Unbanned',value:stats.unbanned||0,colorKey:'green'},{label:'Banned',value:stats.banned||0,colorKey:'red'},{label:'Sold',value:stats.sold||0,colorKey:'amber'},{label:'Unsold',value:stats.unsold||0,colorKey:'slate'},{label:'Avg Level',value:stats.avgLevel||0,colorKey:'violet'}].map(s=><StatCard key={s.label} {...s}/>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:16}}>
        <div style={card} onMouseEnter={hov} onMouseLeave={ho2}>
          <div style={sl}>{dot('#4F46E5')}Level Distribution</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {levelDist.map((r,i)=>{const pct=(r.count/totalLevel)*100;return(
              <div key={r.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>Level {r.label}</span>
                  <div style={{display:'flex',gap:8}}><span style={{fontSize:13,fontWeight:600,color:'var(--primary)'}}>{r.count}</span><span style={{fontSize:11,color:'var(--text3)'}}>{pct.toFixed(0)}%</span></div>
                </div>
                <div style={{height:5,background:'#F3F4F6',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',background:'linear-gradient(90deg,#4F46E5,#818CF8)',borderRadius:99,width:pct+'%',transition:`width 0.7s cubic-bezier(.22,.68,0,1) ${i*0.07}s`}}/></div>
              </div>
            );})}
          </div>
        </div>

        <div style={card} onMouseEnter={hov} onMouseLeave={ho2}>
          <div style={sl}>{dot('#7C3AED')}Last 7 Days</div>
          <div style={{display:'flex',gap:8,alignItems:'flex-end',height:120}}>
            {recent.map((d,i)=>{const h=Math.max(d.count>0?4:2,(d.count/maxRecent)*100);const day=new Date(d.date).toLocaleDateString('en',{weekday:'short'});return(
              <div key={d.date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                {d.count>0&&<span style={{fontSize:11,fontWeight:600,color:'var(--primary)'}}>{d.count}</span>}
                {d.count===0&&<span style={{fontSize:11,color:'transparent'}}>0</span>}
                <div style={{width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'center',height:88}}>
                  <div style={{width:'72%',borderRadius:'4px 4px 0 0',height:h+'%',background:d.count>0?'linear-gradient(180deg,#4F46E5,#818CF8)':'#F3F4F6',transition:`height 0.6s cubic-bezier(.22,.68,0,1) ${i*0.05}s`}}/>
                </div>
                <span style={{fontSize:9.5,color:'var(--text3)',fontWeight:500,textTransform:'uppercase',letterSpacing:0.5}}>{day}</span>
              </div>
            );})}
          </div>
        </div>

        <div style={card} onMouseEnter={hov} onMouseLeave={ho2}>
          <div style={sl}>{dot('#059669')}Status Breakdown</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[{label:'Unbanned',value:stats.unbanned||0,color:'#059669'},{label:'Banned',value:stats.banned||0,color:'#E11D48'},{label:'Sold',value:stats.sold||0,color:'#D97706'},{label:'Unsold',value:stats.unsold||0,color:'#94A3B8'}].map(d=>{const pct=(stats.total||0)>0?(d.value/stats.total)*100:0;return(
              <div key={d.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:6,height:6,borderRadius:'50%',background:d.color}}/><span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{d.label}</span></div>
                  <span style={{fontSize:13,fontWeight:700,color:d.color}}>{d.value}</span>
                </div>
                <div style={{height:4,background:'#F3F4F6',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',background:d.color,borderRadius:99,width:pct+'%',transition:'width 0.6s cubic-bezier(.22,.68,0,1)',opacity:0.85}}/></div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}
