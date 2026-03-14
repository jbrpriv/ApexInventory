import React, { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate } from '../api';
import AccountModal from '../components/AccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { BanStatusBadge, SalesBadge } from '../components/StatusBadge';
import RankBadge from '../components/RankBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { id:'view',   label:'View',   icon:'◈' },
  { id:'add',    label:'Add',    icon:'+' },
  { id:'edit',   label:'Edit',   icon:'✎' },
  { id:'remove', label:'Remove', icon:'✕' },
];

function Lv20Badge({ level, rfrBought }) {
  if (rfrBought) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.25)', color:'var(--gold)', fontSize:11, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:0.5, textTransform:'uppercase', whiteSpace:'nowrap' }}>
      💰 RFR
    </span>
  );
  if (level >= 20) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(0,255,136,0.07)', border:'1px solid rgba(0,255,136,0.2)', color:'var(--safe)', fontSize:11, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:0.5, textTransform:'uppercase', whiteSpace:'nowrap' }}>
      🎮 Made It
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', color:'var(--text3)', fontSize:11, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:0.5, whiteSpace:'nowrap' }}>
      — U20
    </span>
  );
}

export default function AccountsPage() {
  const [tab, setTab] = useState('view');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [showPws, setShowPws] = useState({});
  const [copied, setCopied] = useState('');
  const [viewAccount, setViewAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { sort:sortField, dir:sortDir, limit:500 };
      if (filterStatus) p.accountStatus = filterStatus;
      if (filterSales)  p.salesStatus   = filterSales;
      if (search)       p.search        = search;
      const res = await getAccounts(p);
      setAccounts(Array.isArray(res.data) ? res.data : (res.data.accounts||[]));
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  }, [sortField, sortDir, filterStatus, filterSales, search]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (f) => {
    if (sortField===f) setSortDir(d=>d==='asc'?'desc':'asc');
    else { setSortField(f); setSortDir('asc'); }
  };
  const toggleSel = (id) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const toggleAll = () => setSelected(s=>s.length===accounts.length?[]:accounts.map(a=>a._id));
  const togglePw  = (id) => setShowPws(p=>({...p,[id]:!p[id]}));
  const copyText  = (text,key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(''),1500); toast.success('Copied!',{duration:900}); };

  const doDelete = async () => {
    if (confirmDel==='bulk') { try{await bulkDelete(selected);toast.success(`Deleted ${selected.length}`);setSelected([]);load();}catch{toast.error('Failed');} }
    else { try{await deleteAccount(confirmDel);toast.success('Deleted');load();}catch{toast.error('Failed');} }
    setConfirmDel(null);
  };
  const handleBulkStatus = async (s) => {
    if (!selected.length) return;
    try{await bulkUpdate(selected,{accountStatus:s});toast.success('Updated');setSelected([]);load();}catch{toast.error('Failed');}
  };

  const SortIcon = ({field}) => (
    <span style={{ marginLeft:4, opacity:sortField===field?1:0.25, fontSize:9, color:sortField===field?'var(--neon)':'var(--text3)' }}>
      {sortField===field?(sortDir==='asc'?'▲':'▼'):'▼'}
    </span>
  );

  const CopyBtn = ({text,id}) => (
    <button type="button" onClick={()=>copyText(text,id)} style={{
      background: copied===id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${copied===id?'rgba(0,255,136,0.3)':'var(--border)'}`,
      color: copied===id ? 'var(--safe)' : 'var(--text3)',
      borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:600,
      cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:3,
      fontFamily:'var(--font-display)',
    }}>
      {copied===id ? '✓' : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
    </button>
  );

  const EyeBtn = ({id}) => (
    <button type="button" onClick={()=>togglePw(id)} style={{
      background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)',
      color:'var(--text3)', borderRadius:5, padding:'2px 7px', fontSize:10,
      cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center',
    }}>
      {showPws[id]
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  const tabAccent = { view:'var(--neon)', add:'var(--safe)', edit:'#4d9fff', remove:'var(--danger)' };

  return (
    <div className="fade-in" style={{ minHeight:'100vh', padding:'28px 20px', maxWidth:1440, margin:'0 auto' }}>
      <style>{`
        .tab-btn:hover { color: var(--text) !important; }
        .action-btn { transition: all 0.15s; }
        .action-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:3, height:18, background:'linear-gradient(180deg, var(--neon), var(--violet))', borderRadius:2, boxShadow:'0 0 8px var(--neon)' }} />
            <span style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:4, textTransform:'uppercase', color:'var(--neon)' }}>Inventory</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)', letterSpacing:1 }}>Account Manager</h1>
          <div style={{ color:'var(--text3)', fontSize:12, marginTop:3, fontFamily:'var(--font-mono)' }}>{accounts.length} records loaded</div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', fontSize:11, color:'var(--text3)', fontFamily:'var(--font-display)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(0,255,136,0.1)', border:'1.5px solid rgba(0,255,136,0.3)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>UNBANNED
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:16, height:16, borderRadius:'50%', background:'var(--danger-dim)', border:'1.5px solid rgba(255,51,85,0.3)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>BANNED
          </span>
        </div>
      </div>

      {/* Main panel */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', boxShadow:'var(--sh-card)' }}>
        {/* Top accent */}
        <div style={{ height:1, background:`linear-gradient(90deg, transparent, var(--neon), transparent)`, opacity:0.3 }} />

        {/* Tab bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, padding:'0 20px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', gap:0 }}>
            {TABS.map(t=>{
              const active = tab===t.id;
              const color = tabAccent[t.id];
              return (
                <button key={t.id} type="button" className="tab-btn"
                  onClick={()=>{setTab(t.id);setSelected([]);}}
                  style={{
                    padding:'14px 18px', border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:active?700:500, fontFamily:'var(--font-display)', letterSpacing:1.5, textTransform:'uppercase',
                    color: active ? color : 'var(--text3)',
                    background: active ? `${color}10` : 'transparent',
                    borderBottom: `2px solid ${active?color:'transparent'}`,
                    transition:'all 0.2s', display:'flex', alignItems:'center', gap:7,
                    boxShadow: active ? `inset 0 -2px 12px ${color}22` : 'none',
                  }}
                >
                  <span style={{ width:20, height:20, borderRadius:5, fontSize:12,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
                    color: active ? color : 'var(--text4)', transition:'all 0.2s',
                    boxShadow: active ? `0 0 8px ${color}44` : 'none',
                  }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--neon)', background:'var(--neon-dim)', border:'1px solid rgba(0,217,255,0.2)', padding:'4px 10px', borderRadius:99, fontFamily:'var(--font-display)', letterSpacing:1 }}>
                {selected.length} selected
              </span>
              {tab==='edit'&&<>
                <button type="button" onClick={()=>handleBulkStatus('Unbanned')} style={{ padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:1, background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', color:'var(--safe)', cursor:'pointer' }}>✅ UNBAN</button>
                <button type="button" onClick={()=>handleBulkStatus('Banned')} style={{ padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:1, background:'var(--danger-dim)', border:'1px solid rgba(255,51,85,0.25)', color:'var(--danger)', cursor:'pointer' }}>🚫 BAN</button>
              </>}
              {tab==='remove'&&(
                <button type="button" onClick={()=>setConfirmDel('bulk')} style={{ padding:'6px 14px', borderRadius:6, fontSize:11, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:1, background:'var(--danger-dim)', border:'1px solid rgba(255,51,85,0.35)', color:'var(--danger)', cursor:'pointer', boxShadow:'0 0 12px rgba(255,51,85,0.2)' }}>
                  DELETE {selected.length}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ADD TAB */}
        {tab==='add' && (
          <div style={{ padding:'64px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:420, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(0,217,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{
              width:72, height:72, borderRadius:'50%', marginBottom:20,
              background:'var(--neon-dim)', border:'1.5px solid rgba(0,217,255,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:'var(--neon)',
              boxShadow:'var(--sh-neon)', animation:'neonPulse 2.5s ease-in-out infinite',
            }}>+</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)', marginBottom:10, letterSpacing:2 }}>ADD NEW ACCOUNT</h2>
            <p style={{ color:'var(--text3)', fontSize:13.5, marginBottom:36, textAlign:'center', maxWidth:380, lineHeight:1.65 }}>
              Register a new Apex Legends account. Set credentials, ban status, rank, level 20 origin, and pricing.
            </p>
            <button type="button" onClick={()=>setAddOpen(true)} style={{
              padding:'13px 40px', borderRadius:9, fontSize:13, fontWeight:700,
              fontFamily:'var(--font-display)', letterSpacing:2, textTransform:'uppercase',
              background:'transparent', border:'1.5px solid var(--neon)', color:'var(--neon)',
              cursor:'pointer', boxShadow:'0 0 20px rgba(0,217,255,0.2)',
              transition:'all 0.2s', display:'flex', alignItems:'center', gap:10,
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--neon-dim)';e.currentTarget.style.boxShadow='var(--sh-neon)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 20px rgba(0,217,255,0.2)';}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              ADD ACCOUNT
            </button>
            <div style={{ display:'flex', gap:48, marginTop:52 }}>
              {[
                {label:'TOTAL',    value:accounts.length,                                             color:'var(--neon)'},
                {label:'UNBANNED', value:accounts.filter(a=>a.accountStatus==='Unbanned').length,      color:'var(--safe)'},
                {label:'UNSOLD',   value:accounts.filter(a=>a.salesStatus==='Unsold').length,          color:'var(--gold)'},
              ].map(s=>(
                <div key={s.label} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:32, fontWeight:700, color:s.color, fontFamily:'var(--font-display)', letterSpacing:2, textShadow:`0 0 20px ${s.color}88`, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:9, color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:2.5, textTransform:'uppercase', marginTop:6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW/EDIT/REMOVE */}
        {tab!=='add' && (
          <div style={{ padding:'16px 20px 20px' }}>
            {/* Filters */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
              <div style={{ position:'relative', flex:'1 1 200px', minWidth:0 }}>
                <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email, recovery…"
                  style={{ background:'var(--surface)', border:'1.5px solid var(--border-md)', borderRadius:8, padding:'9px 14px 9px 34px', fontSize:13.5, color:'var(--text)', outline:'none', width:'100%', transition:'all 0.2s', fontFamily:'var(--font-body)' }}
                  onFocus={e=>{e.target.style.borderColor='var(--neon)';e.target.style.boxShadow='0 0 0 3px var(--neon-dim)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--border-md)';e.target.style.boxShadow='none';}}
                />
              </div>
              {[
                {val:filterStatus,set:setFilterStatus,opts:[{v:'',l:'All Status'},{v:'Unbanned',l:'✅ Unbanned'},{v:'Banned',l:'🚫 Banned'}]},
                {val:filterSales, set:setFilterSales, opts:[{v:'',l:'All Sales'}, {v:'Sold',l:'💰 Sold'},    {v:'Unsold',l:'🏪 Unsold'}]},
              ].map((f,i)=>(
                <select key={i} value={f.val} onChange={e=>f.set(e.target.value)} style={{ background:'var(--surface)', border:'1.5px solid var(--border-md)', borderRadius:8, padding:'9px 12px', fontSize:13, color:f.val?'var(--text)':'var(--text3)', cursor:'pointer', minWidth:140, outline:'none', fontFamily:'var(--font-body)' }}>
                  {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
              {(search||filterStatus||filterSales)&&(
                <button type="button" onClick={()=>{setSearch('');setFilterStatus('');setFilterSales('');}} style={{ padding:'8px 14px', borderRadius:8, background:'rgba(255,51,85,0.08)', border:'1px solid rgba(255,51,85,0.25)', color:'var(--danger)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>✕ CLEAR</button>
              )}
            </div>

            {loading ? <LoadingScreen message="Loading accounts…" /> : accounts.length===0 ? (
              <EmptyState title="No Accounts Found" message="Try adjusting your filters or add a new account."
                action={<button type="button" onClick={()=>setTab('add')} style={{ padding:'10px 22px', borderRadius:8, background:'var(--neon-dim)', border:'1px solid rgba(0,217,255,0.3)', color:'var(--neon)', fontSize:12, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase', cursor:'pointer' }}>+ Add Account</button>}
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="accounts-table" style={{ borderRadius:10, border:'1px solid var(--border)', overflow:'hidden' }}>
                  <div style={{ overflowX:'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          {(tab==='edit'||tab==='remove')&&<th style={{ width:42, cursor:'default' }}><input type="checkbox" checked={selected.length===accounts.length&&accounts.length>0} onChange={toggleAll} style={{ cursor:'pointer', accentColor:'var(--neon)', width:14, height:14 }} /></th>}
                          {[
                            {f:'accountStatus',l:'Ban'},
                            {f:'accountEmail',  l:'Email'},
                            {f:'accountPassword',l:'Password'},
                            {f:'accountRecovery',l:'Recovery'},
                            {f:'accountLevel',  l:'Level'},
                            {f:'lv20',          l:'Lv 20'},
                            {f:'rank',          l:'Rank'},
                            {f:'salesStatus',   l:'Sales'},
                            {f:'price',         l:'Price'},
                          ].map(c=>(
                            <th key={c.f} onClick={()=>handleSort(c.f)}>{c.l}<SortIcon field={c.f}/></th>
                          ))}
                          <th style={{ cursor:'default' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((acc,i)=>(
                          <tr key={acc._id} style={{ background: selected.includes(acc._id)?'rgba(0,217,255,0.04)':undefined }}>
                            {(tab==='edit'||tab==='remove')&&<td><input type="checkbox" checked={selected.includes(acc._id)} onChange={()=>toggleSel(acc._id)} style={{ cursor:'pointer', accentColor:'var(--neon)', width:14, height:14 }} /></td>}
                            <td style={{ textAlign:'center' }}><BanStatusBadge status={acc.accountStatus} /></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <span style={{ maxWidth:170, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)', fontFamily:'var(--font-mono)', fontSize:12 }}>{acc.accountEmail}</span>
                                <CopyBtn text={acc.accountEmail} id={'em'+acc._id} />
                              </div>
                            </td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <span style={{ fontFamily:'var(--font-mono)', color:'var(--text2)', fontSize:12, letterSpacing:showPws[acc._id]?0.3:1.5 }}>{showPws[acc._id]?acc.accountPassword:'••••••••'}</span>
                                <EyeBtn id={acc._id} />
                                {showPws[acc._id]&&<CopyBtn text={acc.accountPassword} id={'pw'+acc._id} />}
                              </div>
                            </td>
                            <td><span style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block', fontFamily:'var(--font-mono)', color:'var(--text3)', fontSize:12 }}>{acc.accountRecovery||'—'}{acc.accountRecovery&&<CopyBtn text={acc.accountRecovery} id={'rc'+acc._id} />}</span></td>
                            <td><span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--neon)', fontSize:13, letterSpacing:1, textShadow:'0 0 10px rgba(0,217,255,0.4)' }}>LV.{acc.accountLevel}</span></td>
                            <td><Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought} /></td>
                            <td><RankBadge rank={acc.rank} /></td>
                            <td><SalesBadge status={acc.salesStatus} /></td>
                            <td><span style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--gold)', fontSize:12.5 }}>{acc.price>0?'Rs '+Number(acc.price).toLocaleString('en-PK'):'—'}</span></td>
                            <td>
                              <div style={{ display:'flex', gap:5 }}>
                                {tab==='view'&&<button className="action-btn" type="button" onClick={()=>setViewAccount(acc)} style={{ padding:'5px 13px', borderRadius:6, fontSize:11, fontWeight:700, border:'1px solid rgba(0,217,255,0.25)', background:'var(--neon-dim)', color:'var(--neon)', cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>VIEW</button>}
                                {tab==='edit'&&<button className="action-btn" type="button" onClick={()=>setEditAccount(acc)} style={{ padding:'5px 13px', borderRadius:6, fontSize:11, fontWeight:700, border:'1px solid rgba(77,159,255,0.25)', background:'rgba(77,159,255,0.08)', color:'#4d9fff', cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>EDIT</button>}
                                {tab==='remove'&&<button className="action-btn" type="button" onClick={()=>setConfirmDel(acc._id)} style={{ padding:'5px 13px', borderRadius:6, fontSize:11, fontWeight:700, border:'1px solid rgba(255,51,85,0.25)', background:'var(--danger-dim)', color:'var(--danger)', cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>DEL</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="accounts-mobile" style={{ display:'none', flexDirection:'column', gap:10 }}>
                  {accounts.map(acc=>(
                    <div key={acc._id} style={{ background:'var(--surface)', border:`1px solid ${selected.includes(acc._id)?'rgba(0,217,255,0.4)':'var(--border)'}`, borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                          <BanStatusBadge status={acc.accountStatus} />
                          <SalesBadge status={acc.salesStatus} />
                          <Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought} />
                        </div>
                        {(tab==='edit'||tab==='remove')&&<input type="checkbox" checked={selected.includes(acc._id)} onChange={()=>toggleSel(acc._id)} style={{ cursor:'pointer', accentColor:'var(--neon)', width:16, height:16 }} />}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontWeight:500, color:'var(--text)', marginBottom:8, wordBreak:'break-all', fontSize:13 }}>{acc.accountEmail}</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--neon)', fontSize:14, letterSpacing:1 }}>LV.{acc.accountLevel}</span>
                        <RankBadge rank={acc.rank} />
                        {acc.price>0&&<span style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:600, fontSize:13 }}>Rs {Number(acc.price).toLocaleString('en-PK')}</span>}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {tab==='view'&&<button type="button" onClick={()=>setViewAccount(acc)} style={{ flex:1, padding:'8px', borderRadius:7, background:'var(--neon-dim)', border:'1px solid rgba(0,217,255,0.25)', color:'var(--neon)', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>VIEW</button>}
                        {tab==='edit'&&<button type="button" onClick={()=>setEditAccount(acc)} style={{ flex:1, padding:'8px', borderRadius:7, background:'rgba(77,159,255,0.08)', border:'1px solid rgba(77,159,255,0.25)', color:'#4d9fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>EDIT</button>}
                        {tab==='remove'&&<button type="button" onClick={()=>setConfirmDel(acc._id)} style={{ flex:1, padding:'8px', borderRadius:7, background:'var(--danger-dim)', border:'1px solid rgba(255,51,85,0.25)', color:'var(--danger)', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:1 }}>DELETE</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {addOpen    &&<AccountModal mode="add"  onClose={()=>setAddOpen(false)}    onSaved={()=>{setAddOpen(false);load();}} />}
      {viewAccount&&<AccountModal mode="view" account={viewAccount} onClose={()=>setViewAccount(null)} onSaved={()=>setViewAccount(null)} />}
      {editAccount&&<AccountModal mode="edit" account={editAccount} onClose={()=>setEditAccount(null)} onSaved={()=>{setEditAccount(null);load();}} />}
      {confirmDel &&<ConfirmDialog
        title={confirmDel==='bulk'?`Delete ${selected.length} Accounts`:'Delete Account'}
        message={confirmDel==='bulk'?`Permanently delete ${selected.length} accounts? This cannot be undone.`:'Permanently delete this account? This cannot be undone.'}
        confirmLabel={confirmDel==='bulk'?`Delete ${selected.length}`:'Delete'}
        onConfirm={doDelete} onCancel={()=>setConfirmDel(null)}
      />}
    </div>
  );
}
