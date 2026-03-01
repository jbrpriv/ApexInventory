import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccounts, getStats, getBackground, createAccount, updateAccount, deleteAccount, deleteAccounts } from '../api';
import AccountModal from '../components/AccountModal';
import BackgroundUpload from '../components/BackgroundUpload';
import toast from 'react-hot-toast';

const STATUS_COLORS = { New: '#4fc3f7', Unbanned: '#81c784', Banned: '#e57373' };
const SALES_COLORS = { Unsold: '#ffb74d', Sold: '#81c784' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ accountStatus: '', salesStatus: '', search: '' });
  const [modal, setModal] = useState({ open: false, account: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [bgUrl, setBgUrl] = useState(null);

  // Load background from Cloudinary/DB
  useEffect(() => {
    getBackground()
      .then(res => { if (res.data.url) setBgUrl(res.data.url); })
      .catch(() => {});
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const params = {};
      if (filters.accountStatus) params.accountStatus = filters.accountStatus;
      if (filters.salesStatus) params.salesStatus = filters.salesStatus;
      if (filters.search) params.search = filters.search;
      const res = await getAccounts(params);
      setAccounts(res.data);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, [fetchAccounts, fetchStats]);

  const handleSave = async (data) => {
    try {
      if (modal.account) {
        await updateAccount(modal.account._id, data);
        toast.success('Account updated!');
      } else {
        await createAccount(data);
        toast.success('Account added!');
      }
      setModal({ open: false, account: null });
      fetchAccounts();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving account');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      toast.success('Account deleted');
      setDeleteConfirm(null);
      fetchAccounts();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteAccounts(selected);
      toast.success(`Deleted ${selected.length} accounts`);
      setSelected([]);
      fetchAccounts();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === accounts.length) setSelected([]);
    else setSelected(accounts.map(a => a._id));
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    const aVal = a[sortField], bVal = b[sortField];
    if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const bgStyle = bgUrl ? { backgroundImage: `url(${bgUrl})` } : {};

  return (
    <div className="dashboard" style={bgStyle}>
      <div className="dashboard-overlay" />

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div>
            <h1>APEX ACCOUNTS</h1>
            <span className="header-sub">Management System</span>
          </div>
        </div>
        <div className="header-right">
          <BackgroundUpload currentUrl={bgUrl} onUpdate={setBgUrl} />
          <span className="header-user">👤 {user}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number">{stats.total || 0}</div><div className="stat-label">Total</div></div>
        <div className="stat-card stat-green"><div className="stat-number">{stats.unbanned || 0}</div><div className="stat-label">Unbanned</div></div>
        <div className="stat-card stat-red"><div className="stat-number">{stats.banned || 0}</div><div className="stat-label">Banned</div></div>
        <div className="stat-card stat-blue"><div className="stat-number">{stats.new || 0}</div><div className="stat-label">New</div></div>
        <div className="stat-card stat-orange"><div className="stat-number">{stats.unsold || 0}</div><div className="stat-label">Unsold</div></div>
        <div className="stat-card stat-green"><div className="stat-number">{stats.sold || 0}</div><div className="stat-label">Sold</div></div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-left">
          <input
            className="search-input"
            placeholder="🔍 Search by email or recovery..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          <select className="filter-select" value={filters.accountStatus} onChange={e => setFilters({ ...filters, accountStatus: e.target.value })}>
            <option value="">All Statuses</option>
            <option>New</option>
            <option>Unbanned</option>
            <option>Banned</option>
          </select>
          <select className="filter-select" value={filters.salesStatus} onChange={e => setFilters({ ...filters, salesStatus: e.target.value })}>
            <option value="">All Sales</option>
            <option>Unsold</option>
            <option>Sold</option>
          </select>
        </div>
        <div className="controls-right">
          {selected.length > 0 && (
            <button className="btn-danger" onClick={handleBulkDelete}>🗑 Delete Selected ({selected.length})</button>
          )}
          <button className="btn-primary" onClick={() => setModal({ open: true, account: null })}>+ Add Account</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading accounts...</div>
        ) : (
          <table className="accounts-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === accounts.length && accounts.length > 0} onChange={selectAll} /></th>
                <th onClick={() => handleSort('accountStatus')} className="sortable">Status {sortField === 'accountStatus' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('accountEmail')} className="sortable">Email {sortField === 'accountEmail' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Password</th>
                <th>Add. Password</th>
                <th>Recovery</th>
                <th onClick={() => handleSort('accountLevel')} className="sortable">Level {sortField === 'accountLevel' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('salesStatus')} className="sortable">Sales {sortField === 'salesStatus' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAccounts.length === 0 ? (
                <tr><td colSpan="9" className="no-data">No accounts found</td></tr>
              ) : sortedAccounts.map(acc => (
                <tr key={acc._id} className={selected.includes(acc._id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selected.includes(acc._id)} onChange={() => toggleSelect(acc._id)} /></td>
                  <td><span className="status-badge" style={{ background: STATUS_COLORS[acc.accountStatus] }}>{acc.accountStatus}</span></td>
                  <td>
                    <span className="email-cell">{acc.accountEmail}</span>
                    <button className="btn-copy" onClick={() => copyToClipboard(acc.accountEmail)}>📋</button>
                  </td>
                  <td>
                    <span className="password-cell">{showPasswords[acc._id] ? acc.accountPassword : '••••••••'}</span>
                    <button className="btn-copy" onClick={() => togglePassword(acc._id)}>{showPasswords[acc._id] ? '🙈' : '👁'}</button>
                    <button className="btn-copy" onClick={() => copyToClipboard(acc.accountPassword)}>📋</button>
                  </td>
                  <td>{acc.additionalAccountPassword || '-'}</td>
                  <td>
                    <span className="email-cell">{acc.accountRecovery || '-'}</span>
                    {acc.accountRecovery && acc.accountRecovery !== '-' && (
                      <button className="btn-copy" onClick={() => copyToClipboard(acc.accountRecovery)}>📋</button>
                    )}
                  </td>
                  <td><span className="level-badge">Lvl {acc.accountLevel}</span></td>
                  <td><span className="sales-badge" style={{ background: SALES_COLORS[acc.salesStatus] }}>{acc.salesStatus}</span></td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => setModal({ open: true, account: acc })}>✏️</button>
                    <button className="btn-del" onClick={() => setDeleteConfirm(acc)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">Showing {accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>

      {modal.open && (
        <AccountModal account={modal.account} onClose={() => setModal({ open: false, account: null })} onSave={handleSave} />
      )}

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <h2>⚠️ Confirm Delete</h2>
            <p>Are you sure you want to delete <strong>{deleteConfirm.accountEmail}</strong>?</p>
            <p style={{ color: '#e57373', fontSize: '0.85rem' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger-confirm" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
