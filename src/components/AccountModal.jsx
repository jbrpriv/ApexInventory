import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import { RANKS } from './RankBadge';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';

const EMPTY = {
  accountEmail: '', accountPassword: '', additionalAccountPassword: '', accountRecovery: '',
  accountLevel: '1', rank: 'Unranked', apexUsername: '', apexPlatform: 'PC',
  accountStatus: 'Unbanned', salesStatus: 'Unsold', price: '0', notes: '', rfrBought: false,
};

const fromAccount = (a) => ({
  accountEmail: a.accountEmail || '',
  accountPassword: a.accountPassword || '',
  additionalAccountPassword: a.additionalAccountPassword || '',
  accountRecovery: a.accountRecovery || '',
  accountLevel: String(a.accountLevel || 1),
  rank: a.rank || 'Unranked',
  apexUsername: a.apexUsername || '',
  apexPlatform: a.apexPlatform || 'PC',
  accountStatus: a.accountStatus || 'Unbanned',
  salesStatus: a.salesStatus || 'Unsold',
  price: String(a.price || 0),
  notes: a.notes || '',
  rfrBought: !!a.rfrBought,
});

/* Styles live outside the component so nothing is re-created on every keystroke */
const inp = { display: 'block', width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', transition: 'border-color 0.18s, background 0.18s' };
const lbl = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text3)', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6 };
const fi = (e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--surface)'; };
const fo = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface2)'; };

export default function AccountModal({ account, mode, onClose, onSaved }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(() => (isEdit && account ? fromAccount(account) : EMPTY));
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.accountEmail.trim()) return toast.error('Email is required');
    if (!form.accountPassword.trim()) return toast.error('Password is required');

    const payload = {
      ...form,
      accountLevel: parseInt(form.accountLevel, 10) || 1,
      price: parseFloat(form.price) || 0,
    };

    setSaving(true);
    try {
      if (isEdit) { await updateAccount(account._id, payload); toast.success('Account updated'); }
      else { await createAccount(payload); toast.success('Account added'); }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>

      <form className="modal-box" onSubmit={handleSave}
        style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: 'var(--sh-xl), 0 0 0 1px var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            {isEdit ? 'Edit Account' : 'Add Account'}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Fields: one simple scrolling form */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={lbl}>Email <span style={{ color: 'var(--rose)' }}>*</span></label>
            <input type="email" value={form.accountEmail} onChange={set('accountEmail')} placeholder="account@example.com"
              autoComplete="off" style={inp} onFocus={fi} onBlur={fo} />
          </div>

          <div>
            <label style={{ ...lbl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password <span style={{ color: 'var(--rose)' }}>*</span></span>
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Show or hide password"
                style={{ background: 'transparent', border: 'none', color: 'var(--text4)', cursor: 'pointer', display: 'inline-flex', padding: 2, minHeight: 0, minWidth: 0 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            <input type={showPw ? 'text' : 'password'} value={form.accountPassword} onChange={set('accountPassword')}
              placeholder="Password" autoComplete="new-password" style={inp} onFocus={fi} onBlur={fo} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Extra password / PIN</label>
              <input type={showPw ? 'text' : 'password'} value={form.additionalAccountPassword} onChange={set('additionalAccountPassword')}
                placeholder="Optional" autoComplete="new-password" style={inp} onFocus={fi} onBlur={fo} />
            </div>
            <div>
              <label style={lbl}>Recovery email</label>
              <input type="text" value={form.accountRecovery} onChange={set('accountRecovery')}
                placeholder="Optional" autoComplete="off" style={inp} onFocus={fi} onBlur={fo} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Rank</label>
              <select value={form.rank} onChange={set('rank')} style={{ ...inp, cursor: 'pointer' }} onFocus={fi} onBlur={fo}>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Level</label>
              <input type="number" inputMode="numeric" min={1} value={form.accountLevel} onChange={set('accountLevel')}
                style={inp} onFocus={fi} onBlur={fo} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
            <div>
              <label style={lbl}>In-game username</label>
              <input type="text" value={form.apexUsername} onChange={set('apexUsername')}
                placeholder="Optional" autoComplete="off" style={inp} onFocus={fi} onBlur={fo} />
            </div>
            <div>
              <label style={lbl}>Platform</label>
              <select value={form.apexPlatform} onChange={set('apexPlatform')} style={{ ...inp, cursor: 'pointer' }} onFocus={fi} onBlur={fo}>
                <option value="PC">PC</option>
                <option value="PS4">PS4</option>
                <option value="X1">Xbox</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Ban status</label>
              <select value={form.accountStatus} onChange={set('accountStatus')}
                style={{ ...inp, cursor: 'pointer', color: form.accountStatus === 'Banned' ? 'var(--rose)' : 'var(--text)' }} onFocus={fi} onBlur={fo}>
                <option value="Unbanned">Unbanned</option>
                <option value="Banned">Banned</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Sale status</label>
              <select value={form.salesStatus} onChange={set('salesStatus')} style={{ ...inp, cursor: 'pointer' }} onFocus={fi} onBlur={fo}>
                <option value="Unsold">Unsold</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Price (Rs)</label>
              <input type="number" inputMode="decimal" min={0} value={form.price} onChange={set('price')}
                style={inp} onFocus={fi} onBlur={fo} />
            </div>
            <div>
              <label style={lbl}>Notes</label>
              <input type="text" value={form.notes} onChange={set('notes')}
                placeholder="Optional" autoComplete="off" style={inp} onFocus={fi} onBlur={fo} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)', cursor: 'pointer', minHeight: 0 }}>
            <input type="checkbox" checked={form.rfrBought}
              onChange={(e) => { const c = e.target.checked; setForm((f) => ({ ...f, rfrBought: c })); }}
              style={{ width: 18, height: 18, minHeight: 0, minWidth: 0 }} />
            Level 20 was bought
          </label>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-sm)', background: 'var(--surface2)', display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose}
            style={{ padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}