import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import AccountModal from '../components/AccountModal';
import BackgroundUpload from '../components/BackgroundUpload';

const COLORS = {
  Unbanned: '#00e5a0',
  Banned: '#ff4d6d',
  New: '#4d9fff',
  Sold: '#ffd166',
  Unsold: '#a0aec0',
};

const StatusBadge = ({ status }) => {
  const colors = {
    Unbanned: { bg: 'rgba(0,229,160,0.15)', color: '#00e5a0', border: 'rgba(0,229,160,0.3)' },
    Banned: { bg: 'rgba(255,77,109,0.15)', color: '#ff4d6d', border: 'rgba(255,77,109,0.3)' },
    New: { bg: 'rgba(77,159,255,0.15)', color: '#4d9fff', border: 'rgba(77,159,255,0.3)' },
    Sold: { bg: 'rgba(255,209,102,0.15)', color: '#ffd166', border: 'rgba(255,209,102,0.3)' },
    Unsold: { bg: 'rgba(160,174,192,0.15)', color: '#a0aec0', border: 'rgba(160,174,192,0.3)' },
  };
  const c = colors[status] || colors.Unsold;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', whiteSpace: 'nowrap'
    }}>{status}</span>
  );
};

const MiniBar = ({ data, max }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
    {data.map((d, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 9, color: '#a0aec0' }}>{d.value}</span>
        <div style={{
          width: 22, height: max > 0 ? Math.max(4, (d.value / max) * 32) : 4,
          background: d.color, borderRadius: 3, opacity: 0.85
        }} />
        <span style={{ fontSize: 9, color: '#a0aec0', writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', height: 28 }}>{d.name}</span>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [section, setSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('view');

  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({});
  const [bgUrl, setBgUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [copied, setCopied] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [accsRes, statsRes, bgRes] = await Promise.all([
        api.get('/api/accounts'),
        api.get('/api/accounts/stats'),
        api.get('/api/settings/background'),
      ]);
      setAccounts(accsRes.data);
      setStats(statsRes.data);
      setBgUrl(bgRes.data.url || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 1500);
  };

  const togglePassword = (id) => setShowPasswords(p => ({ ...p, [id]: !p[id] }));
  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleSelectAll = (filtered) => {
    const ids = filtered.map(a => a._id);
    setSelected(s => s.length === ids.length ? [] : ids);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await api.delete(`/api/accounts/${id}`);
    fetchAll();
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} accounts?`)) return;
    await api.delete('/api/accounts', { data: { ids: selected } });
    setSelected([]);
    fetchAll();
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = accounts
    .filter(a => {
      const q = search.toLowerCase();
      if (q && !a.accountEmail?.toLowerCase().includes(q) && !a.accountRecovery?.toLowerCase().includes(q)) return false;
      if (filterStatus && a.accountStatus !== filterStatus) return false;
      if (filterSales && a.salesStatus !== filterSales) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const av = a[sortField] ?? ''; const bv = b[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const navItems = [
    { id: 'home', label: 'Home', icon: '⬡' },
    { id: 'accounts', label: 'Account Manager', icon: '◈' },
    { id: 'about', label: 'About', icon: '◎' },
    { id: 'profile', label: 'Profile', icon: '◉' },
  ];

  const statusChartData = [
    { name: 'Unbanned', value: stats.unbanned || 0, color: COLORS.Unbanned },
    { name: 'Banned', value: stats.banned || 0, color: COLORS.Banned },
    { name: 'New', value: stats.new || 0, color: COLORS.New },
  ];
  const salesChartData = [
    { name: 'Sold', value: stats.sold || 0, color: COLORS.Sold },
    { name: 'Unsold', value: stats.unsold || 0, color: COLORS.Unsold },
  ];
  const maxStatus = Math.max(...statusChartData.map(d => d.value), 1);
  const maxSales = Math.max(...salesChartData.map(d => d.value), 1);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f' }}>
      <div style={{ color: '#00e5a0', fontFamily: 'Rajdhani, sans-serif', fontSize: 22, letterSpacing: 4 }}>LOADING...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Rajdhani', 'Exo 2', sans-serif", color: '#e2e8f0' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,229,160,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#00e5a0', fontSize: 22, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>
            ⬡ APEX
          </span>
          <span style={{ color: '#4d9fff', fontSize: 12, letterSpacing: 3, opacity: 0.7, display: 'none' }} className="nav-subtitle">INVENTORY</span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 4 }} className="desktop-nav">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{
              background: section === item.id ? 'rgba(0,229,160,0.12)' : 'transparent',
              border: section === item.id ? '1px solid rgba(0,229,160,0.3)' : '1px solid transparent',
              color: section === item.id ? '#00e5a0' : '#a0aec0',
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: 1,
              transition: 'all 0.2s'
            }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(o => !o)} className="hamburger" style={{
          background: 'transparent', border: '1px solid rgba(0,229,160,0.3)',
          color: '#00e5a0', width: 36, height: 36, borderRadius: 6,
          cursor: 'pointer', fontSize: 18, display: 'none'
        }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
          background: 'rgba(10,10,15,0.98)', borderBottom: '1px solid rgba(0,229,160,0.2)',
          padding: '8px 0'
        }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setSection(item.id); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: section === item.id ? 'rgba(0,229,160,0.1)' : 'transparent',
              border: 'none', color: section === item.id ? '#00e5a0' : '#a0aec0',
              padding: '12px 24px', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 600, letterSpacing: 1,
              borderLeft: section === item.id ? '3px solid #00e5a0' : '3px solid transparent'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={handleLogout} style={{
            display: 'block', width: '100%', textAlign: 'left',
            background: 'transparent', border: 'none', color: '#ff4d6d',
            padding: '12px 24px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 600, letterSpacing: 1,
            borderLeft: '3px solid transparent'
          }}>
            ⏻ Logout
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ paddingTop: 56 }}>

        {/* ─── HOME ─── */}
        {section === 'home' && (
          <div>
            {/* Hero */}
            <div style={{
              position: 'relative', height: '45vh', minHeight: 280,
              background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0a0a0f 0%, #0d1a2e 50%, #0a0a0f 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(10,10,15,0.85) 100%)'
              }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ color: '#00e5a0', fontSize: 12, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}>
                  APEX LEGENDS INVENTORY
                </div>
                <h1 style={{ margin: 0, fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 900, letterSpacing: 2, color: 'var(--surface)', textShadow: '0 0 40px rgba(0,229,160,0.3)' }}>
                  Welcome Back
                </h1>
                <div style={{ color: '#00e5a0', fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 600, letterSpacing: 3, marginTop: 4 }}>
                  {user?.username?.toUpperCase() || 'ADMIN'}
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: 16 }}>
                <BackgroundUpload onUpload={(url) => setBgUrl(url)} />
              </div>
            </div>

            {/* Stats + Charts */}
            <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
                {[
                  { label: 'Total', value: stats.total || 0, color: '#4d9fff' },
                  { label: 'Unbanned', value: stats.unbanned || 0, color: '#00e5a0' },
                  { label: 'Banned', value: stats.banned || 0, color: '#ff4d6d' },
                  { label: 'New', value: stats.new || 0, color: '#4d9fff' },
                  { label: 'Sold', value: stats.sold || 0, color: '#ffd166' },
                  { label: 'Unsold', value: stats.unsold || 0, color: '#a0aec0' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '16px 12px', textAlign: 'center',
                    borderTop: `2px solid ${s.color}`
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#a0aec0', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

                {/* Account Status Chart */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 12, letterSpacing: 3, color: '#a0aec0', marginBottom: 16, textTransform: 'uppercase' }}>Account Status</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
                    {statusChartData.map(d => (
                      <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                        <div style={{
                          width: '100%', maxWidth: 48,
                          height: maxStatus > 0 ? Math.max(8, (d.value / maxStatus) * 64) : 8,
                          background: `linear-gradient(180deg, ${d.color} 0%, ${d.color}44 100%)`,
                          borderRadius: '4px 4px 0 0', transition: 'height 0.5s'
                        }} />
                        <span style={{ fontSize: 10, color: '#a0aec0', letterSpacing: 1 }}>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Status Chart */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 12, letterSpacing: 3, color: '#a0aec0', marginBottom: 16, textTransform: 'uppercase' }}>Sales Status</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
                    {salesChartData.map(d => (
                      <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                        <div style={{
                          width: '100%', maxWidth: 80,
                          height: maxSales > 0 ? Math.max(8, (d.value / maxSales) * 64) : 8,
                          background: `linear-gradient(180deg, ${d.color} 0%, ${d.color}44 100%)`,
                          borderRadius: '4px 4px 0 0', transition: 'height 0.5s'
                        }} />
                        <span style={{ fontSize: 10, color: '#a0aec0', letterSpacing: 1 }}>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level distribution */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 12, letterSpacing: 3, color: '#a0aec0', marginBottom: 16, textTransform: 'uppercase' }}>Level Range</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: '1–10', count: accounts.filter(a => a.accountLevel <= 10).length },
                      { label: '11–20', count: accounts.filter(a => a.accountLevel > 10 && a.accountLevel <= 20).length },
                      { label: '21–50', count: accounts.filter(a => a.accountLevel > 20 && a.accountLevel <= 50).length },
                      { label: '51+', count: accounts.filter(a => a.accountLevel > 50).length },
                    ].map(r => {
                      const pct = accounts.length ? (r.count / accounts.length) * 100 : 0;
                      return (
                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#a0aec0', width: 32, textAlign: 'right' }}>{r.label}</span>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#4d9fff', borderRadius: 3, transition: 'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#4d9fff', width: 20 }}>{r.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ─── ACCOUNTS ─── */}
        {section === 'accounts' && (
          <div>
            {/* Sub-nav */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(0,229,160,0.1)',
              display: 'flex', gap: 0, padding: '0 24px', overflowX: 'auto'
            }}>
              {[
                { id: 'view', label: '⊞ View All' },
                { id: 'add', label: '+ Add' },
                { id: 'edit', label: '✎ Edit' },
                { id: 'remove', label: '✕ Remove' },
              ].map(tab => (
                <button key={tab.id} onClick={() => {
                  setAccountTab(tab.id);
                  if (tab.id === 'add') { setEditAccount(null); setModalOpen(true); }
                }} style={{
                  background: 'transparent',
                  borderBottom: accountTab === tab.id ? '2px solid #00e5a0' : '2px solid transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  color: accountTab === tab.id ? '#00e5a0' : '#a0aec0',
                  padding: '14px 20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: 1,
                  whiteSpace: 'nowrap', transition: 'all 0.2s'
                }}>
                  {tab.label}
                </button>
              ))}
              {selected.length > 0 && accountTab === 'remove' && (
                <button onClick={handleBulkDelete} style={{
                  marginLeft: 'auto', background: 'rgba(255,77,109,0.15)',
                  border: '1px solid rgba(255,77,109,0.3)', color: '#ff4d6d',
                  padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, alignSelf: 'center'
                }}>
                  Delete Selected ({selected.length})
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <input
                placeholder="🔍 Search email or recovery..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  flex: '1 1 200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', padding: '8px 14px', borderRadius: 6,
                  fontFamily: 'inherit', fontSize: 13, outline: 'none'
                }}
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', padding: '8px 12px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
              }}>
                <option value="">All Status</option>
                <option>Unbanned</option><option>Banned</option><option>New</option>
              </select>
              <select value={filterSales} onChange={e => setFilterSales(e.target.value)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', padding: '8px 12px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer'
              }}>
                <option value="">All Sales</option>
                <option>Sold</option><option>Unsold</option>
              </select>
              <span style={{ color: '#a0aec0', fontSize: 13, padding: '8px 0', alignSelf: 'center' }}>
                {filtered.length} account{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {(accountTab === 'remove') && (
                      <th style={{ padding: '10px 12px', textAlign: 'center', width: 40 }}>
                        <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                          onChange={() => toggleSelectAll(filtered)} style={{ cursor: 'pointer' }} />
                      </th>
                    )}
                    {['accountStatus', 'accountEmail', 'accountPassword', 'additionalAccountPassword', 'accountRecovery', 'accountLevel', 'salesStatus', 'Actions'].map(col => (
                      <th key={col} onClick={() => col !== 'Actions' && handleSort(col)} style={{
                        padding: '10px 12px', textAlign: 'left', color: '#a0aec0',
                        fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                        cursor: col !== 'Actions' ? 'pointer' : 'default', whiteSpace: 'nowrap',
                        userSelect: 'none'
                      }}>
                        {col === 'accountStatus' ? 'Status' : col === 'accountEmail' ? 'Email' :
                          col === 'accountPassword' ? 'Password' : col === 'additionalAccountPassword' ? 'Add. Pass' :
                            col === 'accountRecovery' ? 'Recovery' : col === 'accountLevel' ? 'Level' :
                              col === 'salesStatus' ? 'Sales' : col}
                        {sortField === col && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((acc, i) => (
                    <tr key={acc._id} style={{
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,160,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                    >
                      {accountTab === 'remove' && (
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <input type="checkbox" checked={selected.includes(acc._id)}
                            onChange={() => toggleSelect(acc._id)} style={{ cursor: 'pointer' }} />
                        </td>
                      )}
                      <td style={{ padding: '8px 12px' }}><StatusBadge status={acc.accountStatus} /></td>
                      <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.accountEmail}</span>
                          <button onClick={() => copyText(acc.accountEmail, `email-${acc._id}`)} title="Copy" style={copyBtnStyle}>
                            {copied === `email-${acc._id}` ? '✓' : '⧉'}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', color: '#cbd5e0', letterSpacing: showPasswords[acc._id] ? 0 : 2 }}>
                            {showPasswords[acc._id] ? acc.accountPassword : '••••••••'}
                          </span>
                          <button onClick={() => togglePassword(acc._id)} title="Toggle" style={copyBtnStyle}>
                            {showPasswords[acc._id] ? '◔' : '◑'}
                          </button>
                          <button onClick={() => copyText(acc.accountPassword, `pw-${acc._id}`)} title="Copy" style={copyBtnStyle}>
                            {copied === `pw-${acc._id}` ? '✓' : '⧉'}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#a0aec0' }}>{acc.additionalAccountPassword}</td>
                      <td style={{ padding: '8px 12px', color: '#a0aec0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.accountRecovery}</span>
                          {acc.accountRecovery && acc.accountRecovery !== '-' && (
                            <button onClick={() => copyText(acc.accountRecovery, `rec-${acc._id}`)} title="Copy" style={copyBtnStyle}>
                              {copied === `rec-${acc._id}` ? '✓' : '⧉'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#4d9fff', fontWeight: 700 }}>{acc.accountLevel}</td>
                      <td style={{ padding: '8px 12px' }}><StatusBadge status={acc.salesStatus} /></td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {accountTab === 'edit' && (
                            <button onClick={() => { setEditAccount(acc); setModalOpen(true); }} style={editBtnStyle}>Edit</button>
                          )}
                          {accountTab === 'remove' && (
                            <button onClick={() => handleDelete(acc._id)} style={deleteBtnStyle}>Del</button>
                          )}
                          {accountTab === 'view' && (
                            <button onClick={() => { setEditAccount(acc); setModalOpen(true); }} style={viewBtnStyle}>View</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#4a5568' }}>No accounts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ABOUT ─── */}
        {section === 'about' && (
          <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 12, padding: 32 }}>
              <div style={{ color: '#00e5a0', fontSize: 11, letterSpacing: 4, marginBottom: 8, textTransform: 'uppercase' }}>About</div>
              <h2 style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 900, color: '#fff' }}>Apex Inventory</h2>
              <p style={{ color: '#a0aec0', lineHeight: 1.7, marginBottom: 16 }}>
                A private account management system for Apex Legends accounts. Track account status, manage credentials, and monitor sales — all in one secure dashboard.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                {[
                  ['🔐', 'Secure Auth', 'MongoDB-backed login with bcrypt + JWT sessions'],
                  ['📋', 'Account CRUD', 'Add, edit, delete and view all accounts'],
                  ['📊', 'Live Stats', 'Real-time charts and counters'],
                  ['🖼️', 'Custom BG', 'Upload backgrounds via Cloudinary'],
                  ['🔍', 'Search & Filter', 'Find accounts instantly by email or status'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{title}</div>
                      <div style={{ color: '#a0aec0', fontSize: 13 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PROFILE ─── */}
        {section === 'profile' && (
          <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 12, padding: 32 }}>
              <div style={{ color: '#00e5a0', fontSize: 11, letterSpacing: 4, marginBottom: 8, textTransform: 'uppercase' }}>Profile</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00e5a0, #4d9fff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 900, color: '#0a0a0f'
                }}>
                  {(user?.username?.[0] || 'A').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{user?.username || 'Admin'}</div>
                  <div style={{ fontSize: 12, color: '#00e5a0', letterSpacing: 2 }}>ADMINISTRATOR</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: '#a0aec0', fontSize: 13, marginBottom: 8 }}>Background Image</div>
                <BackgroundUpload onUpload={(url) => setBgUrl(url)} />
                <button onClick={handleLogout} style={{
                  marginTop: 16, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                  color: '#ff4d6d', padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600, letterSpacing: 1
                }}>
                  ⏻ Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <AccountModal
          account={editAccount}
          onClose={() => { setModalOpen(false); setEditAccount(null); setAccountTab('view'); }}
          onSave={() => { setModalOpen(false); setEditAccount(null); setAccountTab('view'); fetchAll(); }}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&family=Exo+2:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0f; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; align-items: center; justify-content: center; }
        }
        @media (min-width: 641px) {
          .hamburger { display: none !important; }
        }
        select option { background: #1a1a2e; color: #e2e8f0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,160,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}

const copyBtnStyle = {
  background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer',
  fontSize: 13, padding: '1px 4px', borderRadius: 3, transition: 'color 0.15s',
  fontFamily: 'inherit'
};

const editBtnStyle = {
  background: 'rgba(77,159,255,0.12)', border: '1px solid rgba(77,159,255,0.25)',
  color: '#4d9fff', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 11, fontWeight: 600
};

const deleteBtnStyle = {
  background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.25)',
  color: '#ff4d6d', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 11, fontWeight: 600
};

const viewBtnStyle = {
  background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)',
  color: '#00e5a0', padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 11, fontWeight: 600
};