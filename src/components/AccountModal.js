import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  accountStatus: 'New',
  accountEmail: '',
  accountPassword: '',
  additionalAccountPassword: '-',
  accountRecovery: '-',
  accountLevel: 1,
  salesStatus: 'Unsold'
};

export default function AccountModal({ account, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setForm({
        accountStatus: account.accountStatus || 'New',
        accountEmail: account.accountEmail || '',
        accountPassword: account.accountPassword || '',
        additionalAccountPassword: account.additionalAccountPassword || '-',
        accountRecovery: account.accountRecovery || '-',
        accountLevel: account.accountLevel || 1,
        salesStatus: account.salesStatus || 'Unsold'
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{account ? 'Edit Account' : 'Add New Account'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Account Status</label>
              <select value={form.accountStatus} onChange={e => setForm({ ...form, accountStatus: e.target.value })}>
                <option>New</option>
                <option>Unbanned</option>
                <option>Banned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sales Status</label>
              <select value={form.salesStatus} onChange={e => setForm({ ...form, salesStatus: e.target.value })}>
                <option>Unsold</option>
                <option>Sold</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Account Email *</label>
            <input
              type="text"
              value={form.accountEmail}
              onChange={e => setForm({ ...form, accountEmail: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Password *</label>
              <input
                type="text"
                value={form.accountPassword}
                onChange={e => setForm({ ...form, accountPassword: e.target.value })}
                placeholder="Password"
                required
              />
            </div>
            <div className="form-group">
              <label>Additional Password</label>
              <input
                type="text"
                value={form.additionalAccountPassword}
                onChange={e => setForm({ ...form, additionalAccountPassword: e.target.value })}
                placeholder="-"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Recovery</label>
              <input
                type="text"
                value={form.accountRecovery}
                onChange={e => setForm({ ...form, accountRecovery: e.target.value })}
                placeholder="recovery@example.com"
              />
            </div>
            <div className="form-group">
              <label>Account Level</label>
              <input
                type="number"
                value={form.accountLevel}
                onChange={e => setForm({ ...form, accountLevel: parseInt(e.target.value) || 1 })}
                min="1"
                max="500"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
