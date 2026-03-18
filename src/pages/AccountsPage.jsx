import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate, syncAllAccounts } from '../api';
import AccountModal from '../components/AccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { BanStatusBadge, SalesBadge } from '../components/StatusBadge';
import RankBadge, { RANK_ORDER } from '../components/RankBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Confetti from 'react-confetti';

const TABS = [
  { id:'view',   label:'View All', icon:'≡' },
  { id:'add',    label:'Add',      icon:'+' },
  { id:'edit',   label:'Edit',     icon:'✎' },
  { id:'remove', label:'Remove',   icon:'✕' },
];
const tabAccent = { view:'#ea580c', add:'#22c55e', edit:'#38bdf8', remove:'#f43f5e' };

function Lv20Badge({ level, rfrBought }) {
  if (rfrBought) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#f59e0b', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>💰 RFR</span>;
  if (level>=20) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#22c55e', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>🎮 Made It</span>;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)', fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>— Under 20</span>;
}

function sortAccounts(accounts, field, dir) {
  const mul = dir==='asc'?1:-1;
  return [...accounts].sort((a,b) => {
    let va, vb;
    if (field==='rank') { va=RANK_ORDER[a.rank]??0; vb=RANK_ORDER[b.rank]??0; }
    else if (field==='lv20') { const s=x=>x.rfrBought?2:x.accountLevel>=20?1:0; va=s(a); vb=s(b); }
    else { va=a[field]; vb=b[field]; if(typeof va==='string')va=va.toLowerCase(); if(typeof vb==='string')vb=vb.toLowerCase(); if(va==null)va=''; if(vb==null)vb=''; }
    if(va<vb)return -1*mul; if(va>vb)return 1*mul; return 0;
  });
}

/* ── PremiumButton ─────────────────────────────────────── */
function PremiumButton({ children, onClick, disabled, color='#ea580c', style={} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-1, boxShadow:`0 6px 20px ${color}45`}:{}}
      whileTap={!disabled?{scale:0.97}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'9px 20px', borderRadius:9, fontSize:13.5, fontWeight:700, background:disabled?`${color}30`:`linear-gradient(135deg,${color},${color}cc)`, border:'none', color:'white', cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.18s', fontFamily:'inherit', ...style }}
    >
      <motion.div initial={{x:'-100%'}} animate={{x:hovered&&!disabled?'200%':'-100%'}} transition={{duration:0.9}}
        style={{ position:'absolute', top:0, left:0, width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', pointerEvents:'none' }}
      />
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:7 }}>{children}</span>
    </motion.button>
  );
}

export default function AccountsPage() {
  const [tab,           setTab]           = useState('view');
  const [accounts,      setAccounts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [filterSales,   setFilterSales]   = useState('');
  const [sortField,     setSortField]     = useState('createdAt');
  const [sortDir,       setSortDir]       = useState('desc');
  const [selected,      setSelected]      = useState([]);
  const [showPws,       setShowPws]       = useState({});
  const [copied,        setCopied]        = useState('');
  const [viewAccount,   setViewAccount]   = useState(null);
  const [editAccount,   setEditAccount]   = useState(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [syncing,       setSyncing]       = useState(false);
  const [syncResult,    setSyncResult]    = useState(null);
  const [showConfetti,  setShowConfetti]  = useState(false);
  const [windowSize,    setWindowSize]    = useState({ width:window.innerWidth, height:window.innerHeight });
  const cardListRef = useRef(null);

  useEffect(() => {
    const h=()=>setWindowSize({width:window.innerWidth,height:window.innerHeight});
    window.addEventListener('resize',h); return()=>window.removeEventListener('resize',h);
  },[]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p={}; if(filterStatus)p.accountStatus=filterStatus; if(filterSales)p.salesStatus=filterSales; if(search)p.search=search;
      const res = await getAccounts({limit:500,...p});
      setAccounts(Array.isArray(res.data)?res.data:(res.data?.accounts||[]));
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  },[filterStatus,filterSales,search]);

  useEffect(()=>{ load(); },[load]);

  useEffect(()=>{
    if(!cardListRef.current)return;
    const cards=cardListRef.current.querySelectorAll('.account-card');
    if(!cards.length)return;
    gsap.fromTo(cards,{opacity:0,y:18,scale:0.97},{opacity:1,y:0,scale:1,duration:0.35,stagger:0.04,ease:'power3.out',clearProps:'transform,opacity'});
  },[accounts,filterStatus,filterSales,search,tab]);

  const sorted=sortAccounts(accounts,sortField,sortDir);
  const handleSort=f=>{ if(sortField===f)setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortField(f);setSortDir('asc');} };
  const toggleSel=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const toggleAll=()=>setSelected(s=>s.length===sorted.length?[]:sorted.map(a=>a._id));
  const togglePw=id=>setShowPws(p=>({...p,[id]:!p[id]}));
  const copyText=(text,key)=>{ navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(''),1500); toast.success('Copied!',{duration:900}); };

  const doDelete=async()=>{
    if(confirmDel==='bulk'){ try{await bulkDelete(selected);toast.success(`Deleted ${selected.length}`);setSelected([]);load();}catch{toast.error('Delete failed');} }
    else{ try{await deleteAccount(confirmDel);toast.success('Deleted');load();}catch{toast.error('Delete failed');} }
    setConfirmDel(null);
  };
  const handleBulkStatus=async s=>{
    if(!selected.length)return;
    try{await bulkUpdate(selected,{accountStatus:s});toast.success('Updated');setSelected([]);load();}catch{toast.error('Update failed');}
  };
  const handleSync=async()=>{
    setSyncing(true);setSyncResult(null);
    try{ const res=await syncAllAccounts(); setSyncResult(res.data); toast.success(`Sync done: ${res.data.synced} updated`,{duration:4000}); load(); }
    catch(err){ toast.error(err?.response?.data?.message||'Sync failed'); }
    finally{setSyncing(false);}
  };
  const handleSaved=()=>{ setAddOpen(false); setShowConfetti(true); load(); setTimeout(()=>setShowConfetti(false),4000); toast.success('Account added! 🎉',{duration:2500}); };

  const SortIcon=({field})=>(<span style={{marginLeft:4,opacity:sortField===field?1:0.25,fontSize:9}}>{sortField===field?(sortDir==='asc'?'▲':'▼'):'▼'}</span>);

  const CopyBtn=({text,id})=>(
    <button type="button" onClick={()=>copyText(text,id)} className="compact-btn"
      style={{ background:copied===id?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.06)', border:`1px solid ${copied===id?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.12)'}`, color:copied===id?'#22c55e':'rgba(255,255,255,0.3)', borderRadius:5, padding:'2px 7px', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:3, minHeight:'auto', minWidth:'auto' }}>
      {copied===id?'✓':<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
    </button>
  );
  const EyeBtn=({id})=>(
    <button type="button" onClick={()=>togglePw(id)} className="compact-btn"
      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.3)', borderRadius:5, padding:'2px 7px', fontSize:11, cursor:'pointer', display:'inline-flex', alignItems:'center', minHeight:'auto', minWidth:'auto' }}>
      {showPws[id]
        ?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <div className="fade-in page-container" style={{ minHeight:'100vh', padding:'28px 20px', maxWidth:1800, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=checkbox]{accent-color:#ea580c;}`}</style>

      {showConfetti && <div className="confetti-layer"><Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={260} gravity={0.22} colors={['#ea580c','#f97316','#22c55e','#38bdf8','#a78bfa','#f59e0b']} /></div>}

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ marginBottom:28, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}
      >
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ width:3, height:16, borderRadius:99, background:'#ea580c', display:'inline-block', boxShadow:'0 0 8px rgba(234,88,12,0.5)' }} />
            <p style={{ fontSize:11, fontWeight:700, color:'#ea580c', letterSpacing:2, textTransform:'uppercase' }}>Inventory</p>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'white', letterSpacing:'-0.5px' }}>Account Manager</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13.5, marginTop:3 }}>{accounts.length} accounts</p>
        </div>

        <div className="header-actions" style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
          <PremiumButton onClick={handleSync} disabled={syncing} color={syncing?'#94a3b8':'#ea580c'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:syncing?'spin 0.8s linear infinite':'none' }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {syncing?'Syncing…':'Sync Accounts'}
          </PremiumButton>

          <AnimatePresence>
            {syncResult && !syncing && (
              <motion.div className="sync-result-banner" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ type:'spring', stiffness:300, damping:28 }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:8, fontSize:12.5, background:syncResult.failed>0?'rgba(245,158,11,0.1)':'rgba(34,197,94,0.1)', border:`1px solid ${syncResult.failed>0?'rgba(245,158,11,0.3)':'rgba(34,197,94,0.3)'}`, color:syncResult.failed>0?'#f59e0b':'#22c55e' }}
              >
                <span>✓ {syncResult.synced} updated</span>
                {syncResult.failed>0&&<span style={{ color:'#f43f5e' }}>· {syncResult.failed} failed</span>}
                <span style={{ color:'rgba(255,255,255,0.3)' }}>· {syncResult.total} checked</span>
                <button type="button" onClick={()=>setSyncResult(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', opacity:0.5, fontSize:12, padding:0, lineHeight:1, minHeight:'auto', minWidth:'auto' }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, type:'spring', stiffness:240, damping:24 }}
        style={{ background:'#0c0c14', borderRadius:18, border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 40px rgba(0,0,0,0.5)', overflow:'hidden' }}
      >
        {/* Tabs */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, padding:'0 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>
          <div className="tab-scroll" style={{ display:'flex' }}>
            {TABS.map(t=>{
              const active=tab===t.id, col=tabAccent[t.id];
              return (
                <motion.button key={t.id} type="button" onClick={()=>{setTab(t.id);setSelected([]);}} whileTap={{ scale:0.96 }}
                  style={{ padding:'14px 18px', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:active?600:500, color:active?col:'rgba(255,255,255,0.4)', background:active?`${col}10`:'transparent', borderBottom:`2px solid ${active?col:'transparent'}`, transition:'all 0.18s', display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap' }}
                >
                  <span style={{ width:20, height:20, borderRadius:5, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', background:active?`${col}20`:'rgba(255,255,255,0.06)', color:active?col:'rgba(255,255,255,0.3)', transition:'all 0.18s' }}>{t.icon}</span>
                  {t.label}
                </motion.button>
              );
            })}
          </div>

          {selected.length>0&&(
            <div className="bulk-bar" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
              <span style={{ fontSize:12.5, fontWeight:600, color:'#ea580c', background:'rgba(234,88,12,0.12)', padding:'4px 10px', borderRadius:99, border:'1px solid rgba(234,88,12,0.2)' }}>{selected.length} selected</span>
              {tab==='edit'&&<>
                <button type="button" onClick={()=>handleBulkStatus('Unbanned')} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', color:'#22c55e', cursor:'pointer', minHeight:'auto' }}>✅ Unbanned</button>
                <button type="button" onClick={()=>handleBulkStatus('Banned')} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(244,63,94,0.12)', border:'1px solid rgba(244,63,94,0.25)', color:'#f43f5e', cursor:'pointer', minHeight:'auto' }}>🚫 Banned</button>
              </>}
              {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel('bulk')} style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:700, background:'#f43f5e', border:'none', color:'white', cursor:'pointer', boxShadow:'0 2px 8px rgba(244,63,94,0.3)', minHeight:'auto' }}>Delete {selected.length}</button>}
            </div>
          )}
        </div>

        {/* ADD TAB */}
        {tab==='add'&&(
          <div style={{ padding:'64px 24px', display:'flex', flexDirection:'column', alignItems:'center', minHeight:400, background:'radial-gradient(ellipse at center, rgba(234,88,12,0.04) 0%, transparent 70%)' }}>
            <motion.div initial={{ opacity:0, scale:0.85, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ type:'spring', stiffness:260, damping:22 }}
              style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#ea580c,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, color:'white', boxShadow:'0 8px 32px rgba(234,88,12,0.4)', marginBottom:20 }}
            >+</motion.div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'white', marginBottom:8 }}>Add New Account</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:32, textAlign:'center', maxWidth:380 }}>Register a new Apex Legends account with credentials, rank, level, and pricing info.</p>
            <PremiumButton onClick={()=>setAddOpen(true)} style={{ padding:'13px 40px' }}>
              + Add Account
            </PremiumButton>
            <div style={{ display:'flex', gap:48, marginTop:52, flexWrap:'wrap', justifyContent:'center' }}>
              {[
                {label:'Total',    val:accounts.length,                                            col:'#ea580c'},
                {label:'Unbanned', val:accounts.filter(a=>a.accountStatus==='Unbanned').length,    col:'#22c55e'},
                {label:'Unsold',   val:accounts.filter(a=>a.salesStatus==='Unsold').length,        col:'#38bdf8'},
              ].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.08}} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:32, fontWeight:800, color:s.col, fontFamily:'var(--font-display)', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, textTransform:'uppercase', letterSpacing:1.5, marginTop:5 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW / EDIT / REMOVE */}
        {tab!=='add'&&(
          <div style={{ padding:'16px 20px 20px' }}>
            {/* Filters */}
            <div className="filters-row" style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
              <div style={{ position:'relative', flex:'1 1 200px', minWidth:0 }}>
                <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email, recovery…"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'9px 14px 9px 34px', fontSize:13.5, color:'white', outline:'none', width:'100%', transition:'all 0.18s' }}
                  onFocus={e=>{e.target.style.borderColor='rgba(234,88,12,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(234,88,12,0.1)';}}
                  onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';}}
                />
              </div>
              {[
                {val:filterStatus,set:setFilterStatus,opts:[{v:'',l:'All Status'},{v:'Unbanned',l:'✅ Unbanned'},{v:'Banned',l:'🚫 Banned'}]},
                {val:filterSales, set:setFilterSales, opts:[{v:'',l:'All Sales'},{v:'Sold',l:'💰 Sold'},{v:'Unsold',l:'🏪 Unsold'}]},
              ].map((f,i)=>(
                <select key={i} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'9px 12px', fontSize:13.5, color:f.val?'white':'rgba(255,255,255,0.35)', cursor:'pointer', minWidth:135, outline:'none' }}>
                  {f.opts.map(o=><option key={o.v} value={o.v} style={{ background:'#0c0c14',color:'white' }}>{o.l}</option>)}
                </select>
              ))}
              {(search||filterStatus||filterSales)&&(
                <motion.button type="button" whileTap={{scale:0.95}} onClick={()=>{setSearch('');setFilterStatus('');setFilterSales('');}}
                  style={{ padding:'8px 14px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:500, cursor:'pointer' }}>✕ Clear</motion.button>
              )}
            </div>

            {loading?(
              <LoadingScreen message="Loading accounts…" />
            ):sorted.length===0?(
              <EmptyState title="No Accounts Found" message="Try adjusting filters or add a new account."
                action={<PremiumButton onClick={()=>setTab('add')} style={{ padding:'10px 22px' }}>+ Add Account</PremiumButton>}
              />
            ):(
              <>
                {/* Desktop table */}
                <div className="accounts-table" style={{ borderRadius:12, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
                  <div style={{ overflowX:'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          {(tab==='edit'||tab==='remove')&&<th style={{ width:42, cursor:'default', background:'#050507' }}><input type="checkbox" checked={selected.length===sorted.length&&sorted.length>0} onChange={toggleAll} style={{ cursor:'pointer', width:14, height:14 }}/></th>}
                          {[{f:'accountStatus',l:'Ban'},{f:'accountEmail',l:'Email'},{f:'apexUsername',l:'Apex ID'},{f:'accountPassword',l:'Password'},{f:'accountRecovery',l:'Recovery'},{f:'accountLevel',l:'Level'},{f:'lv20',l:'Lv 20'},{f:'rank',l:'Rank'},{f:'salesStatus',l:'Sales'},{f:'price',l:'Price'},{f:'lastSynced',l:'Synced'}].map(c=><th key={c.f} onClick={()=>handleSort(c.f)}>{c.l}<SortIcon field={c.f}/></th>)}
                          <th style={{ cursor:'default' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {sorted.map((acc,i)=>(
                            <motion.tr key={acc._id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-20}} transition={{delay:i*0.02}}
                              style={{ background:selected.includes(acc._id)?'rgba(234,88,12,0.06)':undefined }}
                            >
                              {(tab==='edit'||tab==='remove')&&<td><input type="checkbox" checked={selected.includes(acc._id)} onChange={()=>toggleSel(acc._id)} style={{ cursor:'pointer', width:14, height:14 }}/></td>}
                              <td style={{ textAlign:'center' }}><BanStatusBadge status={acc.accountStatus}/></td>
                              <td><div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ maxWidth:165, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.85)', fontFamily:'var(--font-mono)', fontSize:12 }}>{acc.accountEmail}</span><CopyBtn text={acc.accountEmail} id={'em'+acc._id}/></div></td>
                              <td>{acc.apexUsername?<span style={{ fontFamily:'var(--font-mono)', color:'#ea580c', fontSize:12 }}>{acc.apexUsername}</span>:<span style={{ color:'rgba(255,255,255,0.15)' }}>—</span>}</td>
                              <td><div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.45)', fontSize:12, letterSpacing:showPws[acc._id]?0.3:1.5 }}>{showPws[acc._id]?acc.accountPassword:'••••••••'}</span><EyeBtn id={acc._id}/>{showPws[acc._id]&&<CopyBtn text={acc.accountPassword} id={'pw'+acc._id}/>}</div></td>
                              <td><div style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ color:'rgba(255,255,255,0.5)', fontSize:12.5 }}>{acc.accountRecovery||'—'}</span>{acc.accountRecovery&&<CopyBtn text={acc.accountRecovery} id={'rc'+acc._id}/>}</div></td>
                              <td><span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#ea580c', fontSize:14 }}>Lv.{acc.accountLevel}</span></td>
                              <td><Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought}/></td>
                              <td><RankBadge rank={acc.rank}/></td>
                              <td><SalesBadge status={acc.salesStatus}/></td>
                              <td><span style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:'#f59e0b', fontSize:13 }}>{acc.price>0?'Rs '+Number(acc.price).toLocaleString('en-PK'):'—'}</span></td>
                              <td>{acc.lastSynced?<div style={{ fontSize:11.5, color:acc.syncError?'#f43f5e':'#22c55e' }}>{acc.syncError?'⚠ Error':new Date(acc.lastSynced).toLocaleDateString('en-PK',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>:<span style={{ color:'rgba(255,255,255,0.15)', fontSize:12 }}>Never</span>}</td>
                              <td>
                                <div style={{ display:'flex', gap:5 }}>
                                  {tab==='view'&&<button type="button" onClick={()=>setViewAccount(acc)} className="compact-btn" style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', background:'rgba(234,88,12,0.12)', color:'#ea580c', minHeight:'auto', minWidth:'auto' }}>View</button>}
                                  {tab==='edit'&&<button type="button" onClick={()=>setEditAccount(acc)} className="compact-btn" style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', background:'rgba(56,189,248,0.12)', color:'#38bdf8', minHeight:'auto', minWidth:'auto' }}>Edit</button>}
                                  {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel(acc._id)} className="compact-btn" style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', background:'rgba(244,63,94,0.12)', color:'#f43f5e', minHeight:'auto', minWidth:'auto' }}>Delete</button>}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div ref={cardListRef} className="accounts-mobile" style={{ flexDirection:'column', gap:10 }}>
                  {sorted.map(acc=>(
                    <div key={acc._id} className="account-card" style={{ border:`1px solid ${selected.includes(acc._id)?'rgba(234,88,12,0.4)':'rgba(255,255,255,0.07)'}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                          <BanStatusBadge status={acc.accountStatus}/>
                          <SalesBadge status={acc.salesStatus}/>
                          <Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought}/>
                        </div>
                        {(tab==='edit'||tab==='remove')&&<input type="checkbox" checked={selected.includes(acc._id)} onChange={()=>toggleSel(acc._id)} style={{ cursor:'pointer', width:18, height:18 }}/>}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.8)', marginBottom:6, wordBreak:'break-all', fontSize:13 }}>{acc.accountEmail}</div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12, alignItems:'center' }}>
                        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#ea580c', fontSize:14 }}>Lv.{acc.accountLevel}</span>
                        <RankBadge rank={acc.rank}/>
                        {acc.price>0&&<span style={{ color:'#f59e0b', fontWeight:600, fontSize:13, fontFamily:'var(--font-mono)' }}>Rs {Number(acc.price).toLocaleString('en-PK')}</span>}
                        {acc.apexUsername&&<span style={{ fontFamily:'var(--font-mono)', color:'#ea580c', fontSize:12 }}>@{acc.apexUsername}</span>}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {tab==='view'&&<button type="button" onClick={()=>setViewAccount(acc)} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(234,88,12,0.12)', border:'1px solid rgba(234,88,12,0.2)', color:'#ea580c', fontSize:13, fontWeight:600, cursor:'pointer' }}>View Details</button>}
                        {tab==='edit'&&<button type="button" onClick={()=>setEditAccount(acc)} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Edit</button>}
                        {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel(acc._id)} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(244,63,94,0.12)', border:'1px solid rgba(244,63,94,0.2)', color:'#f43f5e', fontSize:13, fontWeight:600, cursor:'pointer' }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {addOpen     &&<AccountModal mode="add"  onClose={()=>setAddOpen(false)}    onSaved={handleSaved}/>}
      {viewAccount &&<AccountModal mode="view" account={viewAccount} onClose={()=>setViewAccount(null)} onSaved={()=>setViewAccount(null)}/>}
      {editAccount &&<AccountModal mode="edit" account={editAccount} onClose={()=>setEditAccount(null)} onSaved={()=>{setEditAccount(null);load();}}/>}
      {confirmDel  &&<ConfirmDialog title={confirmDel==='bulk'?`Delete ${selected.length} Accounts`:'Delete Account'} message={confirmDel==='bulk'?`Permanently delete ${selected.length} accounts? This cannot be undone.`:'Permanently delete this account? This cannot be undone.'} confirmLabel={confirmDel==='bulk'?`Delete ${selected.length}`:'Delete'} onConfirm={doDelete} onCancel={()=>setConfirmDel(null)}/>}
    </div>
  );
}
