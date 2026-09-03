import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate, syncAllAccounts, updateAccount, uploadAccountImages, getAccount } from '../api';
import AccountModal from '../components/AccountModal';
import AccountViewModal from '../components/AccountViewModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge, { BanStatusBadge, SalesBadge } from '../components/StatusBadge';
import RankBadge, { RANK_ORDER } from '../components/RankBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Confetti from 'react-confetti';
import { RefreshCw, Download, CheckCircle, Ban, Trash2, Edit2, KeyRound, MonitorSmartphone, PlusCircle, Search, Settings } from 'lucide-react';

const TABS = [
  { id:'view',   label:'View All', icon:<MonitorSmartphone size={16}/> },
  { id:'add',    label:'Add',      icon:<PlusCircle size={16}/> },
  { id:'edit',   label:'Edit',     icon:<Edit2 size={16}/> },
  { id:'remove', label:'Remove',   icon:<Trash2 size={16}/> },
];
const tabAccent = { view:'var(--primary)', add:'var(--emerald)', edit:'var(--sky)', remove:'var(--rose)' };

function Lv20Badge({ level, rfrBought }) {
  if (rfrBought) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:'var(--amber-bg)', border:'1px solid var(--amber-b)', color:'var(--amber)', fontSize:11.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:0.3 }}>RFR Bought</span>;
  if (level>=20) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:'var(--emerald-bg)', border:'1px solid var(--emerald-b)', color:'var(--emerald)', fontSize:11.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:0.3 }}>Made It</span>;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text4)', fontSize:11.5, fontWeight:500, whiteSpace:'nowrap', letterSpacing:0.3 }}>Under 20</span>;
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

function PremiumButton({ children, onClick, disabled, color='var(--primary)', style={} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      whileHover={!disabled?{y:-1, boxShadow:'var(--sh-md)'}:{}}
      whileTap={!disabled?{scale:0.97}:{}}
      style={{ position:'relative', overflow:'hidden', padding:'10px 20px', borderRadius:8, fontSize:13.5, fontWeight:600, background:disabled?'var(--border)':color, border:'none', color:disabled?'var(--text4)':'white', cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.18s ease', fontFamily:'inherit', boxShadow:disabled?'none':'var(--sh-sm)', ...style }}
    >
      <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:7 }}>{children}</span>
    </motion.button>
  );
}

export default function AccountsPage() {
  const location = useLocation();
  const [tab,           setTab]           = useState(() => new URLSearchParams(location.search).get('add') === 'true' ? 'add' : 'view');
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
  const [quickApexIdAcc, setQuickApexIdAcc] = useState(null);
  const [quickApexIdVal, setQuickApexIdVal] = useState('');
  const [quickLoading,   setQuickLoading]   = useState(false);
  const [missingImagesAcc, setMissingImagesAcc] = useState(null);
  const [lobbyImgFile, setLobbyImgFile] = useState(null);
  const [statsImgFile, setStatsImgFile] = useState(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState(null);
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
    gsap.fromTo(cards,{opacity:0,y:14,scale:0.98},{opacity:1,y:0,scale:1,duration:0.3,stagger:0.03,ease:'power2.out',clearProps:'transform,opacity'});
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

  const saveQuickApexId = async () => {
    if (!quickApexIdVal.trim() || !quickApexIdAcc) return;
    setQuickLoading(true);
    try {
      await updateAccount(quickApexIdAcc._id, { apexUsername: quickApexIdVal.trim() });
      toast.success('Apex ID added!');
      setQuickApexIdAcc(null);
      setQuickApexIdVal('');
      load();
    } catch {
      toast.error('Failed to update Apex ID');
    } finally {
      setQuickLoading(false);
    }
  };

  const saveAccountImages = async () => {
    if (!lobbyImgFile && !statsImgFile) return;
    setImagesLoading(true);
    try {
      const fd = new FormData();
      if (lobbyImgFile) fd.append('lobbyImage', lobbyImgFile);
      if (statsImgFile) fd.append('statsImage', statsImgFile);
      await uploadAccountImages(missingImagesAcc._id, fd);
      toast.success('Images uploaded successfully!');
      setMissingImagesAcc(null);
      setLobbyImgFile(null);
      setStatsImgFile(null);
      load();
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleOpenView = async (acc) => {
    setViewLoadingId(acc._id);
    try {
      const res = await getAccount(acc._id);
      const latestAcc = res.data;
      
      const preloadImage = (src) => new Promise((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; 
      });
      
      await Promise.all([
        preloadImage(latestAcc.lobbyImage),
        preloadImage(latestAcc.statsImage)
      ]);
      
      setViewAccount(latestAcc);
    } catch (err) {
      toast.error('Failed to load details');
    } finally {
      setViewLoadingId(null);
    }
  };

  const SortIcon=({field})=>(<span style={{marginLeft:6,opacity:sortField===field?1:0.3,fontSize:10}}>{sortField===field?(sortDir==='asc'?'▲':'▼'):'▼'}</span>);

  const CopyBtn=({text,id})=>(
    <button type="button" onClick={()=>copyText(text,id)} className="compact-btn"
      style={{ background:copied===id?'var(--emerald-bg)':'var(--surface2)', border:`1px solid ${copied===id?'var(--emerald-b)':'var(--border)'}`, color:copied===id?'var(--emerald)':'var(--text3)', borderRadius:6, padding:'4px', cursor:'pointer', transition:'all 0.15s ease', display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:24, minHeight:24 }}>
      {copied===id?<CheckCircle size={12}/>:<Download size={12}/>}
    </button>
  );
  const EyeBtn=({id})=>(
    <button type="button" onClick={()=>togglePw(id)} className="compact-btn"
      style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', borderRadius:6, padding:'4px', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:24, minHeight:24 }}>
      <KeyRound size={12} />
    </button>
  );

  return (
    <div className="fade-in page-container" style={{ minHeight:'100vh', padding:'32px 24px', maxWidth:1800, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=checkbox]{accent-color:var(--primary);}`}</style>

      {showConfetti && <div className="confetti-layer" style={{pointerEvents:'none',position:'fixed',inset:0,zIndex:999}}><Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={260} gravity={0.22} colors={['#022B22','#B89F70','#FFF']} /></div>}

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ marginBottom:32, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}
      >
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--text)', letterSpacing:'-0.5px' }}>Account Grid</h1>
          <p style={{ color:'var(--text3)', fontSize:14.5, marginTop:4 }}>{accounts.length} registered assets</p>
        </div>

        <div className="header-actions" style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12 }}>
          <PremiumButton onClick={handleSync} disabled={syncing}>
            <RefreshCw size={16} className={syncing?'spin':''} />
            {syncing?'Synchronizing...':'Sync Provider'}
          </PremiumButton>

          <AnimatePresence>
            {syncResult && !syncing && (
              <motion.div className="sync-result-banner" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration: 0.3 }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500, background:syncResult.failed>0?'var(--amber-bg)':'var(--emerald-bg)', border:`1px solid ${syncResult.failed>0?'var(--amber-b)':'var(--emerald-b)'}`, color:syncResult.failed>0?'var(--amber)':'var(--emerald)', boxShadow:'var(--sh-sm)' }}
              >
                <span>{syncResult.synced} Updated</span>
                {syncResult.failed>0&&<span style={{ color:'var(--rose)' }}>• {syncResult.failed} failed</span>}
                <span style={{ color:'var(--text4)' }}>• {syncResult.total} checked</span>
                <button type="button" onClick={()=>setSyncResult(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', opacity:0.6, fontSize:12, padding:0, lineHeight:1 }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.5 }}
        style={{ background:'var(--surface)', borderRadius:16, border:'1px solid var(--border)', boxShadow:'var(--sh-card)', overflow:'hidden' }}
      >
        {/* Tabs */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, padding:'0 24px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
          <div className="tab-scroll" style={{ display:'flex' }}>
            {TABS.map(t=>{
              const active=tab===t.id, col=tabAccent[t.id];
              return (
                <motion.button key={t.id} type="button" onClick={()=>{setTab(t.id);setSelected([]);}} whileTap={{ scale:0.97 }}
                  style={{ padding:'16px 20px', border:'none', cursor:'pointer', fontSize:14, fontWeight:active?600:500, color:active?col:'var(--text3)', background:active?'var(--surface)':'transparent', borderBottom:active?`2px solid ${col}`:`2px solid transparent`, borderTop:`2px solid transparent`, transition:'all 0.2s ease', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}
                >
                  <span style={{ color:active?col:'var(--text4)', display:'flex' }}>{t.icon}</span>
                  {t.label}
                </motion.button>
              );
            })}
          </div>

          {selected.length>0&&(
            <div className="bulk-bar" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 0' }}>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--primary)', background:'var(--primary-pale)', padding:'6px 12px', borderRadius:8, border:'1px solid var(--primary-glow)' }}>{selected.length} selected</span>
              {tab==='edit'&&<>
                <button type="button" onClick={()=>handleBulkStatus('Unbanned')} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600, background:'var(--emerald-bg)', border:'1px solid var(--emerald-b)', color:'var(--emerald)', cursor:'pointer', transition:'background 0.15s' }}>Unbanned</button>
                <button type="button" onClick={()=>handleBulkStatus('Banned')} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600, background:'var(--rose-bg)', border:'1px solid var(--rose-b)', color:'var(--rose)', cursor:'pointer', transition:'background 0.15s' }}>Banned</button>
              </>}
              {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel('bulk')} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600, background:'var(--rose)', border:'none', color:'white', cursor:'pointer', boxShadow:'var(--sh-sm)' }}>Delete All</button>}
            </div>
          )}
        </div>

        {/* ADD TAB */}
        {tab==='add'&&(
          <div style={{ padding:'80px 24px', display:'flex', flexDirection:'column', alignItems:'center', minHeight:400, background:'var(--surface)' }}>
            <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:0.5 }}
              style={{ width:72, height:72, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', boxShadow:'var(--sh-md)', marginBottom:24 }}
            ><PlusCircle size={32}/></motion.div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Deploy New Asset</h2>
            <p style={{ color:'var(--text3)', fontSize:15, marginBottom:40, textAlign:'center', maxWidth:450, lineHeight:1.5 }}>Initialize a new Apex Legends account into the tracking grid with credentials and metrics.</p>
            <PremiumButton onClick={()=>setAddOpen(true)} style={{ padding:'14px 44px' }}>
              <PlusCircle size={18}/> Provision Asset
            </PremiumButton>
          </div>
        )}

        {/* VIEW / EDIT / REMOVE */}
        {tab!=='add'&&(
          <div style={{ padding:'20px 24px 24px' }}>
            {/* Filters */}
            <div className="filters-row" style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
              <div style={{ position:'relative', flex:'1 1 200px', minWidth:0 }}>
                <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text4)' }} size={16}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search identifier, email..."
                  style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px 10px 40px', fontSize:13.5, color:'var(--text)', outline:'none', width:'100%', transition:'all 0.2s', fontWeight:500 }}
                  onFocus={e=>{e.target.style.borderColor='var(--primary)';e.target.style.boxShadow='var(--primary-glow)';e.target.style.background='var(--surface)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';e.target.style.background='var(--surface2)';}}
                />
              </div>
              {[
                {val:filterStatus,set:setFilterStatus,opts:[{v:'',l:'All Status'},{v:'Unbanned',l:'Good Standing'},{v:'Banned',l:'Banned'}]},
                {val:filterSales, set:setFilterSales, opts:[{v:'',l:'All Sales'},{v:'Sold',l:'Sold'},{v:'Unsold',l:'Available'}]},
              ].map((f,i)=>(
                <select key={i} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{ background: f.val ? 'var(--primary-pale)' : 'var(--surface2)', border: `1px solid ${f.val ? 'var(--border-hi)' : 'var(--border)'}`, borderRadius:8, padding:'10px 14px', fontSize:13.5, color: f.val ? 'var(--primary)' : 'var(--text3)', cursor:'pointer', minWidth:140, outline:'none', fontWeight: 600, transition:'all 0.2s' }}>
                  {f.opts.map(o=><option key={o.v} value={o.v} style={{ background:'var(--surface)',color:'var(--text)' }}>{o.l}</option>)}
                </select>
              ))}
              {(search||filterStatus||filterSales)&&(
                <motion.button type="button" whileTap={{scale:0.96}} onClick={()=>{setSearch('');setFilterStatus('');setFilterSales('');}}
                  style={{ padding:'10px 16px', borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', fontSize:13.5, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>Clear Filters</motion.button>
              )}
            </div>

            {loading?(
              <LoadingScreen message="Loading data grid..." />
            ):sorted.length===0?(
              <EmptyState title="No Assets Found" message="Adjust your filters or provision a new account to populate the grid."
                action={<PremiumButton onClick={()=>setTab('add')} style={{ padding:'12px 28px' }}>Provision Asset</PremiumButton>}
              />
            ):(
              <>
                {/* Desktop table */}
                <div className="accounts-table" style={{ borderRadius:10, border:'1px solid var(--border-sm)', overflow:'hidden', boxShadow:'var(--sh-sm)' }}>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'var(--surface2)' }}>
                          {(tab==='edit'||tab==='remove')&&<th style={{ width:42, padding:'14px', borderBottom:'1px solid var(--border-sm)' }}><input type="checkbox" checked={selected.length===sorted.length&&sorted.length>0} onChange={toggleAll} style={{ cursor:'pointer', width:16, height:16 }}/></th>}
                          {[{f:'accountStatus',l:'O. Status'},{f:'accountEmail',l:'Identifier'},{f:'apexUsername',l:'Provider ID'},{f:'accountPassword',l:'Credential'},{f:'accountRecovery',l:'Recovery'},{f:'accountLevel',l:'Level'},{f:'lv20',l:'Target'},{f:'rank',l:'Rank'},{f:'salesStatus',l:'Market'},{f:'tasks',l:'Actions'}].map(c=><th key={c.f} onClick={()=>handleSort(c.f)} style={{ padding:'14px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid var(--border-sm)', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>{c.l}<SortIcon field={c.f}/></th>)}
                          <th style={{ padding:'14px', textAlign:'center', fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid var(--border-sm)' }}>Control</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {sorted.map((acc,i)=>(
                            <motion.tr key={acc._id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
                              style={{ background:selected.includes(acc._id)?'var(--surface2)':'var(--surface)', borderBottom:'1px solid var(--border-sm)' }}
                            >
                              {(tab==='edit'||tab==='remove')&&<td style={{ padding:'14px' }}><input type="checkbox" checked={selected.includes(acc._id)} onChange={()=>toggleSel(acc._id)} style={{ cursor:'pointer', width:16, height:16 }}/></td>}
                              <td style={{ padding:'14px', textAlign:'center' }}><BanStatusBadge status={acc.accountStatus}/></td>
                              <td style={{ padding:'14px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text2)', fontWeight:500, fontSize:13 }}>{acc.accountEmail}</span><CopyBtn text={acc.accountEmail} id={'em'+acc._id}/></div></td>
                              <td style={{ padding:'14px' }}>{acc.apexUsername?<span style={{ fontWeight:600, color:'var(--text2)', fontSize:13 }}>{acc.apexUsername}</span>:<div style={{ color:'var(--text4)' }}>—</div>}</td>
                              <td style={{ padding:'14px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ color:'var(--text3)', fontSize:13, letterSpacing:showPws[acc._id]?0.5:2, fontWeight:500 }}>{showPws[acc._id]?acc.accountPassword:'••••••••'}</span><EyeBtn id={acc._id}/>{showPws[acc._id]&&<CopyBtn text={acc.accountPassword} id={'pw'+acc._id}/>}</div></td>
                              <td style={{ padding:'14px' }}>{acc.accountRecovery ? <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text3)', fontSize:13 }}>{acc.accountRecovery}</span><CopyBtn text={acc.accountRecovery} id={'rc'+acc._id}/></div> : <div style={{ color:'var(--text4)' }}>—</div>}</td>
                              <td style={{ padding:'14px' }}><span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text2)', fontSize:14.5 }}>{acc.accountLevel}</span></td>
                              <td style={{ padding:'14px' }}><Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought}/></td>
                              <td style={{ padding:'14px' }}><RankBadge rank={acc.rank}/></td>
                              <td style={{ padding:'14px' }}><SalesBadge status={acc.salesStatus}/></td>
                              <td style={{ padding:'14px' }}>
                                {!acc.apexUsername ? (
                                  <button type="button" onClick={() => { setQuickApexIdAcc(acc); setQuickApexIdVal(''); }}
                                    style={{ padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>
                                    Map ID
                                  </button>
                                ) : (acc.accountLevel >= 20 && (!acc.lobbyImage || !acc.statsImage)) ? (
                                  <button type="button" onClick={() => { setMissingImagesAcc(acc); setLobbyImgFile(null); setStatsImgFile(null); }}
                                    style={{ padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, background:'var(--sky-bg)', border:'1px solid var(--sky-b)', color:'var(--sky)', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>
                                    Assets
                                  </button>
                                ) : (
                                  <div style={{ textAlign:'center', color:'var(--text4)' }}>—</div>
                                )}
                              </td>
                              <td style={{ padding:'14px' }}>
                                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                                  {tab==='view'&&<button type="button" onClick={()=>handleOpenView(acc)} disabled={viewLoadingId === acc._id} className="compact-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'6px 14px', borderRadius:6, fontSize:12.5, fontWeight:600, border:'1px solid var(--border)', cursor:viewLoadingId === acc._id ? 'wait' : 'pointer', background:'var(--surface2)', color:'var(--text2)', minHeight:28, minWidth:60, transition:'all 0.15s' }}>{viewLoadingId === acc._id ? <RefreshCw size={14} className="spin" /> : 'Inspect'}</button>}
                                  {tab==='edit'&&<button type="button" onClick={()=>setEditAccount(acc)} className="compact-btn" style={{ padding:'6px 14px', borderRadius:6, fontSize:12.5, fontWeight:600, border:'none', cursor:'pointer', background:'var(--sky-bg)', color:'var(--sky)', transition:'all 0.15s' }}>Modify</button>}
                                  {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel(acc._id)} className="compact-btn" style={{ padding:'6px 14px', borderRadius:6, fontSize:12.5, fontWeight:600, border:'none', cursor:'pointer', background:'var(--rose-bg)', color:'var(--rose)', transition:'all 0.15s' }}>Discard</button>}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {addOpen     &&<AccountModal mode="add"  onClose={()=>setAddOpen(false)}    onSaved={handleSaved}/>}
      {viewAccount &&<AccountViewModal account={viewAccount} onClose={()=>setViewAccount(null)}/>}
      {editAccount &&<AccountModal mode="edit" account={editAccount} onClose={()=>setEditAccount(null)} onSaved={()=>{setEditAccount(null);load();}}/>}
      {confirmDel  &&<ConfirmDialog title={confirmDel==='bulk'?`Discard ${selected.length} Assets`:'Discard Asset'} message={confirmDel==='bulk'?'Permanently remove chosen assets from the repository?':'Permanently remove this asset from the repository?'} confirmLabel="Confirm Discard" onConfirm={doDelete} onCancel={()=>setConfirmDel(null)}/>}

      {/* Quick Add Apex ID Modal */}
      {createPortal(
        <AnimatePresence>
          {quickApexIdAcc && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}} exit={{scale:0.95,y:10}} transition={{ duration:0.2 }}
                style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth:340, padding:24, boxShadow:'var(--sh-lg)' }}>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'var(--text)', fontFamily:'var(--font-display)' }}>Map Identifier</h3>
                <p style={{ fontSize:14, color:'var(--text3)', marginBottom:20, lineHeight:1.5 }}>
                  Assign the remote provider ID for <strong style={{ color:'var(--text)' }}>{quickApexIdAcc.accountEmail}</strong>.
                </p>
                <input autoFocus value={quickApexIdVal} onChange={e=>setQuickApexIdVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveQuickApexId()}
                  placeholder="e.g. Provider_ID_01"
                  style={{ width:'100%', padding:'12px 14px', borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, marginBottom:20, outline:'none' }}
                />
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={()=>setQuickApexIdAcc(null)}
                    style={{ flex:1, padding:'10px', borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={saveQuickApexId} disabled={quickLoading || !quickApexIdVal.trim()}
                    style={{ flex:1, padding:'10px', borderRadius:8, background:'var(--primary)', border:'none', color:'white', fontSize:14, fontWeight:600, cursor:quickLoading||!quickApexIdVal.trim()?'not-allowed':'pointer', opacity:quickLoading||!quickApexIdVal.trim()?0.6:1 }}>
                    {quickLoading ? 'Deploying...' : 'Assign ID'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Image Upload Modal */}
      {createPortal(
        <AnimatePresence>
          {missingImagesAcc && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}} exit={{scale:0.95,y:10}} transition={{ duration:0.2 }}
                style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth:400, padding:24, boxShadow:'var(--sh-lg)' }}>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'var(--text)', fontFamily:'var(--font-display)' }}>Asset Documentation</h3>
                <p style={{ fontSize:14, color:'var(--text3)', marginBottom:20, lineHeight:1.5 }}>
                  Target reached. Provide documentation materials for <strong style={{ color:'var(--text)' }}>{missingImagesAcc.accountEmail}</strong>.
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Lobby Image {missingImagesAcc.lobbyImage && <span style={{color:'var(--emerald)', marginLeft:5}}>✓ Cached</span>}</label>
                    <label style={{ display:'block', padding:lobbyImgFile?0:24, border:'2px dashed var(--border-sm)', borderRadius:10, textAlign:'center', cursor:'pointer', background:'var(--surface2)', overflow:'hidden', position:'relative', transition:'all 0.2s' }}>
                      <input type="file" accept="image/*" onChange={e=>setLobbyImgFile(e.target.files[0])} style={{ display:'none' }} />
                      {lobbyImgFile ? (
                        <img src={URL.createObjectURL(lobbyImgFile)} alt="Lobby" style={{ width:'100%', height:120, objectFit:'cover', display:'block' }} />
                      ) : (
                        <div style={{ color:'var(--text4)', fontSize:13, fontWeight:500 }}>Select Material</div>
                      )}
                    </label>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Stats Image {missingImagesAcc.statsImage && <span style={{color:'var(--emerald)', marginLeft:5}}>✓ Cached</span>}</label>
                    <label style={{ display:'block', padding:statsImgFile?0:24, border:'2px dashed var(--border-sm)', borderRadius:10, textAlign:'center', cursor:'pointer', background:'var(--surface2)', overflow:'hidden', position:'relative', transition:'all 0.2s' }}>
                      <input type="file" accept="image/*" onChange={e=>setStatsImgFile(e.target.files[0])} style={{ display:'none' }} />
                      {statsImgFile ? (
                        <img src={URL.createObjectURL(statsImgFile)} alt="Stats" style={{ width:'100%', height:120, objectFit:'cover', display:'block' }} />
                      ) : (
                        <div style={{ color:'var(--text4)', fontSize:13, fontWeight:500 }}>Select Material</div>
                      )}
                    </label>
                  </div>
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={()=>{setMissingImagesAcc(null);setLobbyImgFile(null);setStatsImgFile(null);}}
                    style={{ flex:1, padding:'10px', borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={saveAccountImages} disabled={imagesLoading || (!lobbyImgFile && !statsImgFile)}
                    style={{ flex:1, padding:'10px', borderRadius:8, background:'var(--primary)', border:'none', color:'white', fontSize:14, fontWeight:600, cursor:imagesLoading||(!lobbyImgFile&&!statsImgFile)?'not-allowed':'pointer', opacity:imagesLoading||(!lobbyImgFile&&!statsImgFile)?0.6:1 }}>
                    {imagesLoading ? 'Uploading...' : 'Transmit Data'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}