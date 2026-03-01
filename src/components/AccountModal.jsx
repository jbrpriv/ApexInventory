import React, { useState, useEffect } from 'react';
import { createAccount, updateAccount } from '../api';
import toast from 'react-hot-toast';

const EMPTY = {
  accountStatus: 'New', accountEmail: '', accountPassword: '',
  additionalAccountPassword: '-', accountRecovery: '-',
  accountLevel: 1, salesStatus: 'Unsold', notes: '', price: 0,
};

const iStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text)', padding: '9px 13px', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
};

export default function AccountModal({ account, onClose, onSaved, readOnly = false }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (account) {
      setForm({
        accountStatus: account.accountStatus || 'New',
        accountEmail: account.accountEmail || '',
        accountPassword: account.accountPassword || '',
        additionalAccountPassword: account.additionalAccountPassword || '-',
        accountRecovery: account.accountRecovery || '-',
        accountLevel: account.accountLevel || 1,
        salesStatus: account.salesStatus || 'Unsold',
        notes: account.notes || '',
        price: account.price || 0,
      });
    } else {
      setForm(EMPTY);
    }
  }, [account]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.accountEmail.trim()) return toast.error('Email is required');
    if (!form.accountPassword.trim()) return toast.error('Password is required');
    setSaving(true);
    try {
      if (account) {
        await updateAccount(account._id, form);
        toast.success('Account updated');
      } else {
        await createAccount(form);
        toast.success('Account added');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!', { duration: 1200 });
  };

  const title = readOnly ? 'View Account' : account ? 'Edit Account' : 'Add Account';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        width: '100%', maxWidth: 540,
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--card)',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--primary-light)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {readOnly ? 'View' : account ? 'Editing' : 'New'}
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            color: 'var(--text2)', width: 32, height: 32, borderRadius: 8,
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Account Status', key: 'accountStatus', opts: ['New','Unbanned','Banned'] },
              { label: 'Sales Status', key: 'salesStatus', opts: ['Unsold','Sold'] },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => set(f.key, e.target.value)} disabled={readOnly} style={iStyle}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>
              Account Email *
              {readOnly && form.accountEmail && <button onClick={() => copyText(form.accountEmail)} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: 11, cursor: 'pointer' }}>⧉ Copy</button>}
            </label>
            <input value={form.accountEmail} onChange={e => set('accountEmail', e.target.value)} placeholder="email@example.com" readOnly={readOnly} style={iStyle} />
          </div>

          {/* Password row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>
                Password *
                {readOnly && <button onClick={() => copyText(form.accountPassword)} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: 11, cursor: 'pointer' }}>⧉ Copy</button>}
              </label>
              <div style={{ position: 'relative' }}>
                <input value={form.accountPassword} onChange={e => set('accountPassword', e.target.value)}
                  type={showPw ? 'text' : 'password'} placeholder="Password" readOnly={readOnly}
                  style={{ ...iStyle, paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
                }}>{showPw ? '◔' : '◑'}</button>
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Add. Password</label>
              <input value={form.additionalAccountPassword} onChange={e => set('additionalAccountPassword', e.target.value)} placeholder="-" readOnly={readOnly} style={iStyle} />
            </div>
          </div>

          {/* Recovery + Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <div>
              <label style={{ color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Recovery Email</label>
              <input value={form.accountRecovery} onChange={e => set('accountRecovery', e.target.value)} placeholder="recovery@example.com" readOnly={readOnly} style={iStyle} />
            </div>
            <div style={{ minWidth: 90 }}>
              <label style={{ color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Level</label>
              <input type="number" min={1} max={999} value={form.accountLevel}
                onChange={e => set('accountLevel', parseInt(e.target.value) || 1)} readOnly={readOnly} style={iStyle} />
            </div>
          </div>

          {/* Price + Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div>
              <label style={{ color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Price ($)</label>
              <input type="number" min={0} step={0.01} value={form.price}
                onChange={e => set('price', parseFloat(e.target.value) || 0)} readOnly={readOnly} style={iStyle} />
            </div>
            <div>
              <label style={{ color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Notes</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." readOnly={readOnly} style={iStyle} />
            </div>
          </div>

          {/* Actions */}
          {!readOnly && (
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px', borderRadius: 8,
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 14, fontWeight: 600,
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '10px', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}>
                {saving ? 'Saving...' : account ? 'Save Changes' : 'Add Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
