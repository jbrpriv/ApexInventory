import React, { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate, syncAllAccounts } from '../api';
import AccountModal from '../components/AccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { BanStatusBadge, SalesBadge } from '../components/StatusBadge';
import RankBadge, { RANK_ORDER } from '../components/RankBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { id:'view',   label:'View All', icon:'≡' },
  { id:'add',    label:'Add',      icon:'+' },
  { id:'edit',   label:'Edit',     icon:'✎' },
  { id:'remove', label:'Remove',   icon:'✕' },
];

// ── Lv20 badge ──────────────────────────────────────────────────────────────
function Lv20Badge({ level, rfrBought }) {
  if (rfrBought) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'#FFFBEB', border:'1px solid #FCD34D', color:'#92400E', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
      💰 RFR
    </span>
  );
  if (level >= 20) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'#ECFDF5', border:'1px solid #6EE7B7', color:'#065F46', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
      🎮 Made It
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#94A3B8', fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>
      — Under 20
    </span>
  );
}

// ── Client-side sort helpers ─────────────────────────────────────────────────
function sortAccounts(accounts, field, dir) {
  const mul = dir === 'asc' ? 1 : -1;
  return [...accounts].sort((a, b) => {
    let va, vb;

    if (field === 'rank') {
      va = RANK_ORDER[a.rank] ?? 0;
      vb = RANK_ORDER[b.rank] ?? 0;
    } else if (field === 'lv20') {
      // Sort: RFR Bought(2) > Made It(1) > Under 20(0)
      const score = x => x.rfrBought ? 2 : x.accountLevel >= 20 ? 1 : 0;
      va = score(a); vb = score(b);
    } else {
      va = a[field]; vb = b[field];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va === undefined || va === null) va = '';
      if (vb === undefined || vb === null) vb = '';
    }

    if (va < vb) return -1 * mul;
    if (va > vb) return  1 * mul;
    return 0;
  });
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AccountsPage() {
  const [tab, setTab]       = useState('view');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSales,  setFilterSales]  = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc');
  const [selected,  setSelected]  = useState([]);
  const [showPws,   setShowPws]   = useState({});
  const [copied,    setCopied]    = useState('');
  const [viewAccount, setViewAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [addOpen,     setAddOpen]     = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [syncing,     setSyncing]     = useState(false);
  const [syncResult,  setSyncResult]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { limit: 500 };
      if (filterStatus) p.accountStatus = filterStatus;
      if (filterSales)  p.salesStatus   = filterSales;
      if (search)       p.search        = search;
      const res = await getAccounts(p);
      setAccounts(Array.isArray(res.data) ? res.data : (res.data.accounts || []));
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  }, [filterStatus, filterSales, search]);

  useEffect(() => { load(); }, [load]);

  // Client-side sort applied after fetch
  const sorted = sortAccounts(accounts, sortField, sortDir);

  const handleSort = (f) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const toggleSel = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === sorted.length ? [] : sorted.map(a => a._id));
  const togglePw  = (id) => setShowPws(p => ({ ...p, [id]: !p[id] }));
  const copyText  = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
    toast.success('Copied!', { duration: 900 });
  };

  const doDelete = async () => {
    if (confirmDel === 'bulk') {
      try { await bulkDelete(selected); toast.success(`Deleted ${selected.length}`); setSelected([]); load(); }
      catch { toast.error('Delete failed'); }
    } else {
      try { await deleteAccount(confirmDel); toast.success('Deleted'); load(); }
      catch { toast.error('Delete failed'); }
    }
    setConfirmDel(null);
  };

  const handleBulkStatus = async (s) => {
    if (!selected.length) return;
    try { await bulkUpdate(selected, { accountStatus: s }); toast.success('Updated'); setSelected([]); load(); }
    catch { toast.error('Update failed'); }
  };

  const handleSync = async () => {
    setSyncing(true); setSyncResult(null);
    try {
      const res = await syncAllAccounts();
      setSyncResult(res.data);
      toast.success(`Sync done: ${res.data.synced} updated`, { duration: 4000 });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Sync failed');
    } finally { setSyncing(false); }
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.25, fontSize: 9 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
    </span>
  );

  const CopyBtn = ({ text, id }) => (
    <button type="button" onClick={() => copyText(text, id)} style={{ background: copied === id ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${copied === id ? '#6EE7B7' : '#E5E7EB'}`, color: copied === id ? '#059669' : '#9CA3AF', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {copied === id ? '✓' : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
    </button>
  );

  const EyeBtn = ({ id }) => (
    <button type="button" onClick={() => togglePw(id)} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#9CA3AF', borderRadius: 5, padding: '2px 7px', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
      {showPws[id]
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  const tabAccent = { view: '#4F46E5', add: '#059669', edit: '#0284C7', remove: '#E11D48' };

  return (
    <div className="fade-in" style={{ minHeight: '100vh', padding: '28px 20px', maxWidth: 1800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Inventory</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>Account Manager</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13.5, marginTop: 3 }}>{accounts.length} accounts</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <button type="button" onClick={handleSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: syncing ? '#F3F4F6' : 'white', border: `1px solid ${syncing ? '#E5E7EB' : 'var(--border-md)'}`, color: syncing ? '#9CA3AF' : 'var(--primary)', cursor: syncing ? 'not-allowed' : 'pointer', boxShadow: syncing ? 'none' : 'var(--sh-sm)', transition: 'all 0.18s' }}
            onMouseEnter={e => { if (!syncing) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.15)'; }}}
            onMouseLeave={e => { if (!syncing) { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)'; }}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {syncing ? 'Syncing…' : 'Sync Accounts'}
          </button>
          {syncResult && !syncing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, fontSize: 12.5, background: syncResult.failed > 0 ? '#FFFBEB' : '#ECFDF5', border: `1px solid ${syncResult.failed > 0 ? '#FCD34D' : '#6EE7B7'}`, color: syncResult.failed > 0 ? '#92400E' : '#065F46' }}>
              <span>✓ {syncResult.synced} updated</span>
              {syncResult.failed > 0 && <span style={{ color: '#E11D48' }}>· {syncResult.failed} failed</span>}
              <span style={{ color: 'var(--text4)' }}>· {syncResult.total} checked</span>
              {syncResult.skipped > 0 && <span style={{ color: 'var(--text4)' }}>· {syncResult.skipped} skipped</span>}
              <button type="button" onClick={() => setSyncResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--sh-md)', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '0 20px', borderBottom: '1px solid var(--border)', background: '#FAFBFF' }}>
          <div style={{ display: 'flex' }}>
            {TABS.map(t => {
              const active = tab === t.id;
              const col = tabAccent[t.id];
              return (
                <button key={t.id} type="button" onClick={() => { setTab(t.id); setSelected([]); }} style={{ padding: '14px 18px', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? col : 'var(--text3)', background: active ? col + '0F' : 'transparent', borderBottom: `2px solid ${active ? col : 'transparent'}`, transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? col + '20' : '#F3F4F6', color: active ? col : '#9CA3AF', transition: 'all 0.18s' }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-pale)', padding: '4px 10px', borderRadius: 99 }}>{selected.length} selected</span>
              {tab === 'edit' && <>
                <button type="button" onClick={() => handleBulkStatus('Unbanned')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#059669', cursor: 'pointer' }}>✅ Unbanned</button>
                <button type="button" onClick={() => handleBulkStatus('Banned')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#FFF1F2', border: '1px solid #FECACA', color: '#E11D48', cursor: 'pointer' }}>🚫 Banned</button>
              </>}
              {tab === 'remove' && <button type="button" onClick={() => setConfirmDel('bulk')} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: '#E11D48', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(225,29,72,0.25)' }}>Delete {selected.length}</button>}
            </div>
          )}
        </div>

        {/* ADD TAB */}
        {tab === 'add' && (
          <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400, background: 'linear-gradient(135deg,#F7F8FF,#F0F4FF)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'white', boxShadow: '0 8px 24px rgba(79,70,229,0.3)', marginBottom: 20 }}>+</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Add New Account</h2>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 32, textAlign: 'center', maxWidth: 380 }}>Register a new Apex Legends account with credentials, rank, level, and pricing info.</p>
            <button type="button" onClick={() => setAddOpen(true)} style={{ padding: '12px 36px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,#4F46E5,#818CF8)', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.3)', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.3)'; }}
            >+ Add Account</button>
            <div style={{ display: 'flex', gap: 48, marginTop: 52 }}>
              {[
                { label: 'Total',    val: accounts.length,                                              col: '#4F46E5' },
                { label: 'Unbanned', val: accounts.filter(a => a.accountStatus === 'Unbanned').length,  col: '#059669' },
                { label: 'Unsold',   val: accounts.filter(a => a.salesStatus   === 'Unsold').length,    col: '#0284C7' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: s.col, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW / EDIT / REMOVE */}
        {tab !== 'add' && (
          <div style={{ padding: '16px 20px 20px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email, recovery…"
                  style={{ background: 'white', border: '1px solid var(--border-md)', borderRadius: 9, padding: '9px 14px 9px 34px', fontSize: 13.5, color: 'var(--text)', outline: 'none', width: '100%', transition: 'all 0.18s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {[
                { val: filterStatus, set: setFilterStatus, ph: 'All Status', opts: [{ v: '', l: 'All Status' }, { v: 'Unbanned', l: '✅ Unbanned' }, { v: 'Banned', l: '🚫 Banned' }] },
                { val: filterSales,  set: setFilterSales,  ph: 'All Sales',  opts: [{ v: '', l: 'All Sales'  }, { v: 'Sold',   l: '💰 Sold'   }, { v: 'Unsold', l: '🏪 Unsold' }] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ background: 'white', border: '1px solid var(--border-md)', borderRadius: 9, padding: '9px 12px', fontSize: 13.5, color: f.val ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', minWidth: 135, outline: 'none' }}>
                  {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
              {(search || filterStatus || filterSales) && <button type="button" onClick={() => { setSearch(''); setFilterStatus(''); setFilterSales(''); }} style={{ padding: '8px 14px', borderRadius: 9, background: '#F3F4F6', border: '1px solid #E5E7EB', color: 'var(--text3)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>✕ Clear</button>}
            </div>

            {loading ? <LoadingScreen message="Loading accounts…" /> : sorted.length === 0 ? (
              <EmptyState title="No Accounts Found" message="Try adjusting filters or add a new account."
                action={<button type="button" onClick={() => setTab('add')} className="btn-primary" style={{ padding: '10px 22px' }}>+ Add Account</button>}
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="accounts-table" style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          {(tab === 'edit' || tab === 'remove') && <th style={{ width: 42, cursor: 'default' }}><input type="checkbox" checked={selected.length === sorted.length && sorted.length > 0} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 14, height: 14 }} /></th>}
                          {[
                            { f: 'accountStatus',  l: 'Ban' },
                            { f: 'accountEmail',   l: 'Email' },
                            { f: 'apexUsername',   l: 'Apex ID' },
                            { f: 'accountPassword',l: 'Password' },
                            { f: 'accountRecovery',l: 'Recovery' },
                            { f: 'accountLevel',   l: 'Level' },
                            { f: 'lv20',           l: 'Lv 20' },
                            { f: 'rank',           l: 'Rank' },
                            { f: 'salesStatus',    l: 'Sales' },
                            { f: 'price',          l: 'Price' },
                            { f: 'lastSynced',     l: 'Synced' },
                          ].map(c => <th key={c.f} onClick={() => handleSort(c.f)}>{c.l}<SortIcon field={c.f} /></th>)}
                          <th style={{ cursor: 'default' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map(acc => (
                          <tr key={acc._id} style={{ background: selected.includes(acc._id) ? '#EEF2FF' : undefined }}>
                            {(tab === 'edit' || tab === 'remove') && <td><input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)} style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 14, height: 14 }} /></td>}
                            <td style={{ textAlign: 'center' }}><BanStatusBadge status={acc.accountStatus} /></td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ maxWidth: 165, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{acc.accountEmail}</span><CopyBtn text={acc.accountEmail} id={'em' + acc._id} /></div></td>
                            <td>{acc.apexUsername ? <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 12 }}>{acc.apexUsername}</span> : <span style={{ color: 'var(--text5)' }}>—</span>}</td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 12, letterSpacing: showPws[acc._id] ? 0.3 : 1.5 }}>{showPws[acc._id] ? acc.accountPassword : '••••••••'}</span><EyeBtn id={acc._id} />{showPws[acc._id] && <CopyBtn text={acc.accountPassword} id={'pw' + acc._id} />}</div></td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: 'var(--text3)', fontSize: 12.5 }}>{acc.accountRecovery || '—'}</span>{acc.accountRecovery && <CopyBtn text={acc.accountRecovery} id={'rc' + acc._id} />}</div></td>
                            <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Lv.{acc.accountLevel}</span></td>
                            <td><Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought} /></td>
                            <td><RankBadge rank={acc.rank} /></td>
                            <td><SalesBadge status={acc.salesStatus} /></td>
                            <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#D97706', fontSize: 13 }}>{acc.price > 0 ? 'Rs ' + Number(acc.price).toLocaleString('en-PK') : '—'}</span></td>
                            <td>
                              {acc.lastSynced
                                ? <div style={{ fontSize: 11.5, color: acc.syncError ? '#E11D48' : '#059669' }} title={acc.syncError || ''}>
                                    {acc.syncError ? '⚠ Error' : new Date(acc.lastSynced).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                : <span style={{ color: 'var(--text5)', fontSize: 12 }}>Never</span>
                              }
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 5 }}>
                                {tab === 'view'   && <button type="button" onClick={() => setViewAccount(acc)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary-pale)', color: 'var(--primary)' }}>View</button>}
                                {tab === 'edit'   && <button type="button" onClick={() => setEditAccount(acc)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: '#EFF6FF', color: '#0284C7' }}>Edit</button>}
                                {tab === 'remove' && <button type="button" onClick={() => setConfirmDel(acc._id)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: '#FFF1F2', color: '#E11D48' }}>Delete</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="accounts-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
                  {sorted.map(acc => (
                    <div key={acc._id} style={{ background: 'white', border: `1px solid ${selected.includes(acc._id) ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--sh-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                          <BanStatusBadge status={acc.accountStatus} />
                          <SalesBadge status={acc.salesStatus} />
                          <Lv20Badge level={acc.accountLevel} rfrBought={acc.rfrBought} />
                        </div>
                        {(tab === 'edit' || tab === 'remove') && <input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)} style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 16, height: 16 }} />}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', marginBottom: 8, wordBreak: 'break-all', fontSize: 13 }}>{acc.accountEmail}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Lv.{acc.accountLevel}</span>
                        <RankBadge rank={acc.rank} />
                        {acc.price > 0 && <span style={{ color: '#D97706', fontWeight: 600, fontSize: 13 }}>Rs {Number(acc.price).toLocaleString('en-PK')}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {tab === 'view'   && <button type="button" onClick={() => setViewAccount(acc)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'var(--primary-pale)', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View Details</button>}
                        {tab === 'edit'   && <button type="button" onClick={() => setEditAccount(acc)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: '#EFF6FF', border: 'none', color: '#0284C7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>}
                        {tab === 'remove' && <button type="button" onClick={() => setConfirmDel(acc._id)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: '#FFF1F2', border: 'none', color: '#E11D48', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {addOpen     && <AccountModal mode="add"  onClose={() => setAddOpen(false)}    onSaved={() => { setAddOpen(false); load(); }} />}
      {viewAccount && <AccountModal mode="view" account={viewAccount} onClose={() => setViewAccount(null)} onSaved={() => setViewAccount(null)} />}
      {editAccount && <AccountModal mode="edit" account={editAccount} onClose={() => setEditAccount(null)} onSaved={() => { setEditAccount(null); load(); }} />}
      {confirmDel  && <ConfirmDialog title={confirmDel === 'bulk' ? `Delete ${selected.length} Accounts` : 'Delete Account'} message={confirmDel === 'bulk' ? `Permanently delete ${selected.length} accounts? This cannot be undone.` : 'Permanently delete this account? This cannot be undone.'} confirmLabel={confirmDel === 'bulk' ? `Delete ${selected.length}` : 'Delete'} onConfirm={doDelete} onCancel={() => setConfirmDel(null)} />}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
