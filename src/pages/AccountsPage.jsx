import React, { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount, bulkDelete, bulkUpdate } from '../api';
import AccountModal from '../components/AccountModal';
import StatusBadge from '../components/StatusBadge';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'view',   label: '⊞ View All' },
  { id: 'add',    label: '+ Add' },
  { id: 'edit',   label: '✎ Edit' },
  { id: 'remove', label: '✕ Remove' },
];

export default function AccountsPage() {
  const [tab, setTab] = useState('view');
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [showPws, setShowPws] = useState({});
  const [copied, setCopied] = useState('');
  const [modalAccount, setModalAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: sortField, dir: sortDir, limit: 500 };
      if (filterStatus) params.accountStatus = filterStatus;
      if (filterSales) params.salesStatus = filterSales;
      if (search) params.search = search;
      const res = await getAccounts(params);
      setAccounts(res.data.accounts || res.data);
      setTotal(res.data.total || (res.data.accounts || res.data).length);
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  }, [sortField, sortDir, filterStatus, filterSales, search]);

  useEffect(() => { load(); }, [load]);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
    toast.success('Copied!', { duration: 900 });
  };

  const togglePw = (id) => setShowPws(p => ({ ...p, [id]: !p[id] }));
  const toggleSel = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === accounts.length ? [] : accounts.map(a => a._id));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try { await deleteAccount(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} account(s)?`)) return;
    try { await bulkDelete(selected); toast.success(`Deleted ${selected.length} accounts`); setSelected([]); load(); }
    catch { toast.error('Bulk delete failed'); }
  };

  const handleBulkStatus = async (accountStatus) => {
    if (!selected.length) return;
    try { await bulkUpdate(selected, { accountStatus }); toast.success('Status updated'); setSelected([]); load(); }
    catch { toast.error('Update failed'); }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openModal = (account = null, readOnly = false) => {
    setModalAccount(account);
    setModalReadOnly(readOnly);
    setModalOpen(true);
  };

  const handleTabClick = (id) => {
    setTab(id);
    setSelected([]);
    if (id === 'add') openModal(null, false);
  };

  const thStyle = (field) => ({
    padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)',
    cursor: field !== 'actions' ? 'pointer' : 'default', whiteSpace: 'nowrap',
    userSelect: 'none', background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
  });

  const tdStyle = { padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' };

  const copyBtn = (text, key) => (
    <button onClick={() => copyText(text, key)} title="Copy" style={{
      background: 'none', border: 'none', color: copied === key ? 'var(--green)' : 'var(--text3)',
      cursor: 'pointer', fontSize: 12, padding: '1px 4px', borderRadius: 4, transition: 'color 0.15s',
    }}>{copied === key ? '✓' : '⧉'}</button>
  );

  return (
    <div className="fade-in">
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 20px', overflowX: 'auto',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabClick(t.id)} style={{
            background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            color: tab === t.id ? 'var(--primary-light)' : 'var(--text3)',
            padding: '14px 18px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            whiteSpace: 'nowrap', transition: 'all 0.18s',
          }}>{t.label}</button>
        ))}

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
            <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>{selected.length} selected</span>
            {tab === 'edit' && (
              <>
                {['Unbanned', 'Banned', 'New'].map(s => (
                  <button key={s} onClick={() => handleBulkStatus(s)} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    color: 'var(--text2)', padding: '5px 10px', borderRadius: 6,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>{s}</button>
                ))}
              </>
            )}
            {tab === 'remove' && (
              <button onClick={handleBulkDelete} style={{
                background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.3)',
                color: 'var(--red)', padding: '5px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Delete {selected.length}</button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 10, padding: '12px 20px', flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
      }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search email, recovery..."
          style={{
            flex: '1 1 200px', background: 'var(--card)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '8px 14px', borderRadius: 8,
            fontFamily: 'inherit', fontSize: 13, outline: 'none', minWidth: 0,
          }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
          background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)',
          padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <option value="">All Status</option>
          <option>Unbanned</option><option>Banned</option><option>New</option>
        </select>
        <select value={filterSales} onChange={e => setFilterSales(e.target.value)} style={{
          background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)',
          padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <option value="">All Sales</option>
          <option>Sold</option><option>Unsold</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
          {accounts.length} accounts
        </span>
      </div>

      {/* Table / mobile cards */}
      {loading ? <LoadingScreen message="Fetching accounts..." /> : accounts.length === 0 ? (
        <EmptyState icon="◈" title="No Accounts Found"
          message="Try adjusting your filters or add a new account."
          action={<button onClick={() => openModal(null, false)} style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>+ Add Account</button>}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="desktop-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {(tab === 'remove' || tab === 'edit') && (
                    <th style={{ ...thStyle(''), width: 40, textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.length === accounts.length && accounts.length > 0}
                        onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                    </th>
                  )}
                  {[
                    { field: 'accountStatus', label: 'Status' },
                    { field: 'accountEmail', label: 'Email' },
                    { field: 'accountPassword', label: 'Password' },
                    { field: 'accountRecovery', label: 'Recovery' },
                    { field: 'accountLevel', label: 'Level' },
                    { field: 'salesStatus', label: 'Sales' },
                    { field: 'price', label: 'Price' },
                    { field: 'actions', label: 'Actions' },
                  ].map(col => (
                    <th key={col.field} onClick={() => col.field !== 'actions' && handleSort(col.field)} style={thStyle(col.field)}>
                      {col.label}
                      {sortField === col.field && <span style={{ color: 'var(--primary-light)', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, i) => (
                  <tr key={acc._id}
                    style={{ background: selected.includes(acc._id) ? 'rgba(139,92,246,0.05)' : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!selected.includes(acc._id)) e.currentTarget.style.background = 'rgba(139,92,246,0.04)'; }}
                    onMouseLeave={e => { if (!selected.includes(acc._id)) e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'; }}
                  >
                    {(tab === 'remove' || tab === 'edit') && (
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                      </td>
                    )}
                    <td style={tdStyle}><StatusBadge status={acc.accountStatus} /></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: 13 }}>{acc.accountEmail}</span>
                        {copyBtn(acc.accountEmail, 'em' + acc._id)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text2)', fontSize: 12 }}>
                          {showPws[acc._id] ? acc.accountPassword : '••••••••'}
                        </span>
                        <button onClick={() => togglePw(acc._id)} style={{
                          background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12,
                        }}>{showPws[acc._id] ? '◔' : '◑'}</button>
                        {showPws[acc._id] && copyBtn(acc.accountPassword, 'pw' + acc._id)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)', fontSize: 12 }}>
                          {acc.accountRecovery || '-'}
                        </span>
                        {acc.accountRecovery && acc.accountRecovery !== '-' && copyBtn(acc.accountRecovery, 'rc' + acc._id)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--cyan)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Lv.{acc.accountLevel}</span>
                    </td>
                    <td style={tdStyle}><StatusBadge status={acc.salesStatus} /></td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                        {acc.price > 0 ? '$' + acc.price.toFixed(2) : '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {tab === 'view' && (
                          <button onClick={() => openModal(acc, true)} style={{
                            background: 'var(--primary-dim)', border: '1px solid var(--border-accent)',
                            color: 'var(--primary-light)', padding: '3px 10px', borderRadius: 6,
                            cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                          }}>View</button>
                        )}
                        {tab === 'edit' && (
                          <button onClick={() => openModal(acc, false)} style={{
                            background: 'var(--cyan-dim)', border: '1px solid rgba(34,211,238,0.25)',
                            color: 'var(--cyan)', padding: '3px 10px', borderRadius: 6,
                            cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                          }}>Edit</button>
                        )}
                        {tab === 'remove' && (
                          <button onClick={() => handleDelete(acc._id)} style={{
                            background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)',
                            color: 'var(--red)', padding: '3px 10px', borderRadius: 6,
                            cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                          }}>Del</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: 10, padding: '12px 16px' }}>
            {accounts.map(acc => (
              <div key={acc._id} style={{
                background: 'var(--card)', border: selected.includes(acc._id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <StatusBadge status={acc.accountStatus} />
                    <StatusBadge status={acc.salesStatus} />
                  </div>
                  {(tab === 'remove' || tab === 'edit') && (
                    <input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSel(acc._id)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  )}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>EMAIL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--text)', fontSize: 13, wordBreak: 'break-all' }}>{acc.accountEmail}</span>
                    {copyBtn(acc.accountEmail, 'mem' + acc._id)}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>LEVEL</div>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Lv.{acc.accountLevel}</span>
                  </div>
                  {acc.price > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>PRICE</div>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>${acc.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {tab === 'view' && <button onClick={() => openModal(acc, true)} style={{ flex: 1, background: 'var(--primary-dim)', border: '1px solid var(--border-accent)', color: 'var(--primary-light)', padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>View Details</button>}
                  {tab === 'edit' && <button onClick={() => openModal(acc, false)} style={{ flex: 1, background: 'var(--cyan-dim)', border: '1px solid rgba(34,211,238,0.25)', color: 'var(--cyan)', padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Edit</button>}
                  {tab === 'remove' && <button onClick={() => handleDelete(acc._id)} style={{ flex: 1, background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--red)', padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <AccountModal
          account={modalAccount}
          readOnly={modalReadOnly}
          onClose={() => { setModalOpen(false); setModalAccount(null); }}
          onSaved={() => { setModalOpen(false); setModalAccount(null); load(); }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
