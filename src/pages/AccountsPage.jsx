import React, { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate } from '../api';
import AccountModal from '../components/AccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'view',   label: 'View All', icon: '≡' },
  { id: 'add',    label: 'Add',      icon: '+' },
  { id: 'edit',   label: 'Edit',     icon: '✎' },
  { id: 'remove', label: 'Remove',   icon: '⊗' },
];

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

  const [viewAccount, setViewAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: sortField, dir: sortDir, limit: 500 };
      if (filterStatus) params.accountStatus = filterStatus;
      if (filterSales)  params.salesStatus   = filterSales;
      if (search)       params.search        = search;
      const res = await getAccounts(params);
      setAccounts(Array.isArray(res.data) ? res.data : (res.data.accounts || []));
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  }, [sortField, sortDir, filterStatus, filterSales, search]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.25, fontSize: 10 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
    </span>
  );

  const toggleSel = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === accounts.length ? [] : accounts.map(a => a._id));
  const togglePw  = (id) => setShowPws(p => ({ ...p, [id]: !p[id] }));

  const [copied, setCopied] = useState('');
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 1500);
    toast.success('Copied!', { duration: 900 });
  };

  const doDelete = async () => {
    if (confirmDel === 'bulk') {
      try { await bulkDelete(selected); toast.success(`Deleted ${selected.length} accounts`); setSelected([]); load(); }
      catch { toast.error('Bulk delete failed'); }
    } else {
      try { await deleteAccount(confirmDel); toast.success('Account deleted'); load(); }
      catch { toast.error('Delete failed'); }
    }
    setConfirmDel(null);
  };

  const handleBulkStatus = async (accountStatus) => {
    if (!selected.length) return;
    try { await bulkUpdate(selected, { accountStatus }); toast.success('Status updated'); setSelected([]); load(); }
    catch { toast.error('Update failed'); }
  };

  const thStyle = { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text3)', background: 'var(--bg)', whiteSpace: 'nowrap', userSelect: 'none', borderBottom: '2px solid var(--border)', cursor: 'pointer' };
  const tdStyle = { padding: '11px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copyText(text, id)} title="Copy" style={{
      background: copied === id ? 'var(--green-bg)' : 'var(--bg3)',
      border: '1px solid ' + (copied === id ? 'var(--green-b)' : 'var(--border)'),
      color: copied === id ? 'var(--green)' : 'var(--text4)',
      borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {copied === id
        ? <>✓</>
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  );

  const EyeBtn = ({ id }) => (
    <button onClick={() => togglePw(id)} title={showPws[id] ? 'Hide' : 'Show'} style={{
      background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 5, padding: '2px 7px',
      fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {showPws[id]
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  const tabColors = { view: 'var(--primary)', add: 'var(--green)', edit: 'var(--blue)', remove: 'var(--red)' };
  const tabBgColors = { view: 'var(--primary-pale)', add: 'var(--green-bg)', edit: 'var(--blue-bg)', remove: 'var(--red-bg)' };

  return (
    <div className="fade-in" style={{ minHeight: '100vh', padding: '28px 24px', maxWidth: 1300, margin: '0 auto' }}>

      {/* Page header — no tabs here */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Account Manager
        </h1>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 3 }}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} loaded
        </div>
      </div>

      {/* Main content box with tabs INSIDE */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)', overflow: 'hidden' }}>

        {/* ── Tab bar inside the box ── */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0 20px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const col = tabColors[t.id];
              const bg = tabBgColors[t.id];
              return (
                <button key={t.id} onClick={() => { setTab(t.id); setSelected([]); }} style={{
                  padding: '14px 20px', border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                  color: isActive ? col : 'var(--text3)',
                  background: isActive ? bg : 'transparent',
                  borderBottom: `2.5px solid ${isActive ? col : 'transparent'}`,
                  transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                    background: isActive ? col : 'var(--bg3)',
                    color: isActive ? 'white' : 'var(--text4)',
                    transition: 'all 0.18s',
                  }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-pale)', padding: '4px 10px', borderRadius: 99 }}>
                {selected.length} selected
              </span>
              {tab === 'edit' && ['Unbanned', 'Banned', 'New'].map(s => (
                <button key={s} onClick={() => handleBulkStatus(s)} style={{
                  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                }}>{s}</button>
              ))}
              {tab === 'remove' && (
                <button onClick={() => setConfirmDel('bulk')} style={{
                  padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                  background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                }}>Delete {selected.length}</button>
              )}
            </div>
          )}
        </div>

        {/* ── ADD TAB: Big prominent section ── */}
        {tab === 'add' && (
          <div style={{
            padding: '60px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 420, background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f0f9ff 100%)',
          }}>
            {/* Icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green), #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(5,150,105,0.35)',
              marginBottom: 24, fontSize: 36, color: 'white',
            }}>+</div>

            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
              Add New Account
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 32, textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
              Add a new Apex Legends account to your inventory. Fill in credentials, level, and sales status.
            </p>

            <button onClick={() => setAddOpen(true)} style={{
              padding: '14px 40px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              border: 'none', color: 'white', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
              transition: 'all 0.18s', letterSpacing: 0.2,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(5,150,105,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(5,150,105,0.4)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add New Account
            </button>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[
                { label: 'Total Accounts', value: accounts.length, color: 'var(--primary)' },
                { label: 'Unbanned', value: accounts.filter(a => a.accountStatus === 'Unbanned').length, color: 'var(--green)' },
                { label: 'Unsold', value: accounts.filter(a => a.salesStatus === 'Unsold').length, color: 'var(--blue)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VIEW / EDIT / REMOVE: Filters + Table ── */}
        {tab !== 'add' && (
          <div style={{ padding: '18px 20px 20px' }}>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email, recovery…"
                  style={{ background: 'white', border: '1.5px solid var(--border-md)', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13.5, color: 'var(--text)', outline: 'none', width: '100%', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {[
                { val: filterStatus, set: setFilterStatus, placeholder: 'All Status', opts: ['Unbanned', 'Banned', 'New'] },
                { val: filterSales,  set: setFilterSales,  placeholder: 'All Sales',  opts: ['Sold', 'Unsold'] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{
                  background: 'white', border: '1.5px solid var(--border-md)', borderRadius: 10,
                  padding: '9px 14px', fontSize: 13.5, color: f.val ? 'var(--text)' : 'var(--text3)',
                  cursor: 'pointer', minWidth: 130, outline: 'none',
                }}>
                  <option value="">{f.placeholder}</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              {(search || filterStatus || filterSales) && (
                <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterSales(''); }} style={{
                  padding: '8px 14px', borderRadius: 9, background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text3)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>Clear</button>
              )}
            </div>

            {/* Table */}
            {loading ? <LoadingScreen message="Fetching accounts…" /> : accounts.length === 0 ? (
              <EmptyState title="No Accounts Found" message="Try adjusting your search or filters, or add a new account."
                action={<button onClick={() => setTab('add')} className="btn-primary" style={{ padding: '10px 22px' }}>+ Add Account</button>}
              />
            ) : (
              <>
                <div className="accounts-table" style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                      <thead>
                        <tr>
                          {(tab === 'edit' || tab === 'remove') && (
                            <th style={{ ...thStyle, width: 44, cursor: 'default' }}>
                              <input type="checkbox" checked={selected.length === accounts.length && accounts.length > 0}
                                onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 16, height: 16 }} />
                            </th>
                          )}
                          {[
                            { field: 'accountStatus',  label: 'Status'   },
                            { field: 'accountEmail',   label: 'Email'    },
                            { field: 'accountPassword',label: 'Password' },
                            { field: 'accountRecovery',label: 'Recovery' },
                            { field: 'accountLevel',   label: 'Level'    },
                            { field: 'salesStatus',    label: 'Sales'    },
                            { field: 'price',          label: 'Price'    },
                          ].map(col => (
                            <th key={col.field} onClick={() => handleSort(col.field)} style={thStyle}>
                              {col.label}<SortIcon field={col.field} />
                            </th>
                          ))}
                          <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((acc, i) => (
                          <tr key={acc._id}
                            style={{ background: selected.includes(acc._id) ? '#f5f3ff' : i % 2 === 0 ? 'white' : '#fafbff', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!selected.includes(acc._id)) e.currentTarget.style.background = '#f5f3ff'; }}
                            onMouseLeave={e => { if (!selected.includes(acc._id)) e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafbff'; }}
                          >
                            {(tab === 'edit' || tab === 'remove') && (
                              <td style={tdStyle}>
                                <input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 16, height: 16 }} />
                              </td>
                            )}
                            <td style={tdStyle}><StatusBadge status={acc.accountStatus} /></td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontWeight: 500 }}>{acc.accountEmail}</span>
                                <CopyBtn text={acc.accountEmail} id={'em' + acc._id} />
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--text3)', fontSize: 12.5, letterSpacing: showPws[acc._id] ? 0.3 : 1.5 }}>
                                  {showPws[acc._id] ? acc.accountPassword : '••••••••'}
                                </span>
                                <EyeBtn id={acc._id} />
                                {showPws[acc._id] && <CopyBtn text={acc.accountPassword} id={'pw' + acc._id} />}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)', fontSize: 12.5 }}>
                                  {acc.accountRecovery || '—'}
                                </span>
                                {acc.accountRecovery && <CopyBtn text={acc.accountRecovery} id={'rc' + acc._id} />}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Lv.{acc.accountLevel}</span>
                            </td>
                            <td style={tdStyle}><StatusBadge status={acc.salesStatus} /></td>
                            <td style={tdStyle}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: 'var(--amber)', fontSize: 12.5 }}>
                                {acc.price > 0 ? '$' + Number(acc.price).toFixed(2) : '—'}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', gap: 5 }}>
                                {tab === 'view' && (
                                  <button onClick={() => setViewAccount(acc)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary-pale)', color: 'var(--primary)', transition: 'all 0.15s' }}>View</button>
                                )}
                                {tab === 'edit' && (
                                  <button onClick={() => setEditAccount(acc)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--blue-bg)', color: 'var(--blue)', transition: 'all 0.15s' }}>Edit</button>
                                )}
                                {tab === 'remove' && (
                                  <button onClick={() => setConfirmDel(acc._id)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--red-bg)', color: 'var(--red)', transition: 'all 0.15s' }}>Delete</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="accounts-mobile" style={{ display: 'none', flexDirection: 'column', gap: 12 }}>
                  {accounts.map(acc => (
                    <div key={acc._id} style={{
                      background: 'white', border: selected.includes(acc._id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--sh-sm)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <StatusBadge status={acc.accountStatus} />
                          <StatusBadge status={acc.salesStatus} />
                        </div>
                        {(tab === 'edit' || tab === 'remove') && (
                          <input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)} style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 18, height: 18 }} />
                        )}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, wordBreak: 'break-all', fontSize: 13.5 }}>{acc.accountEmail}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Level</div>
                          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Lv.{acc.accountLevel}</div>
                        </div>
                        {acc.price > 0 && (
                          <div style={{ background: 'var(--amber-bg)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Price</div>
                            <div style={{ fontWeight: 700, color: 'var(--amber)', fontSize: 16 }}>${Number(acc.price).toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {tab === 'view'   && <button onClick={() => setViewAccount(acc)}  style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'var(--primary-pale)', border: 'none', color: 'var(--primary)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>View Details</button>}
                        {tab === 'edit'   && <button onClick={() => setEditAccount(acc)}  style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'var(--blue-bg)',     border: 'none', color: 'var(--blue)',    fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Edit</button>}
                        {tab === 'remove' && <button onClick={() => setConfirmDel(acc._id)} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'var(--red-bg)',     border: 'none', color: 'var(--red)',     fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {addOpen && <AccountModal mode="add" onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); load(); }} />}
      {viewAccount && <AccountModal mode="view" account={viewAccount} onClose={() => setViewAccount(null)} onSaved={() => setViewAccount(null)} />}
      {editAccount && <AccountModal mode="edit" account={editAccount} onClose={() => setEditAccount(null)} onSaved={() => { setEditAccount(null); load(); }} />}
      {confirmDel && (
        <ConfirmDialog
          title={confirmDel === 'bulk' ? `Delete ${selected.length} Accounts` : 'Delete Account'}
          message={confirmDel === 'bulk'
            ? `Are you sure you want to permanently delete ${selected.length} selected account${selected.length > 1 ? 's' : ''}? This cannot be undone.`
            : 'Are you sure you want to permanently delete this account? This cannot be undone.'}
          confirmLabel={confirmDel === 'bulk' ? `Delete ${selected.length} Accounts` : 'Delete Account'}
          onConfirm={doDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .accounts-table { display: none; }
          .accounts-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
