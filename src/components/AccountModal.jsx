import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import toast from 'react-hot-toast';

const EMPTY = {
  accountStatus: 'New',
  accountEmail: '',
  accountPassword: '',
  additionalAccountPassword: '',
  accountRecovery: '',
  accountLevel: 1,
  salesStatus: 'Unsold',
  notes: '',
  price: 0,
  rfrBought: false,
};

export default function AccountModal({ account, mode, onClose, onSaved }) {
  const isView = mode === 'view';
  const isAdd  = mode === 'add';
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isAdd) {
      setForm(EMPTY);
      setShowPw(false);
      setShowAddPw(false);
    } else if (account && (isView || isEdit)) {
      setForm({
        accountStatus:             account.accountStatus             || 'New',
        accountEmail:              account.accountEmail              || '',
        accountPassword:           account.accountPassword           || '',
        additionalAccountPassword: account.additionalAccountPassword || '',
        accountRecovery:           account.accountRecovery           || '',
        accountLevel:              account.accountLevel              || 1,
        salesStatus:               account.salesStatus               || 'Unsold',
        notes:                     account.notes                     || '',
        price:                     account.price                     || 0,
        rfrBought:                 account.rfrBought                 || false,
      });
      setShowPw(isView);
      setShowAddPw(false);
    }
    setSaving(false);
  }, [account, mode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const copyField = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
    toast.success('Copied!', { duration: 900 });
  };

  const handleSave = async () => {
    if (!form.accountEmail.trim())    return toast.error('Email is required');
    if (!form.accountPassword.trim()) return toast.error('Password is required');
    setSaving(true);
    try {
      if (isEdit) {
        await updateAccount(account._id, form);
        toast.success('Account updated');
      } else {
        await createAccount(form);
        toast.success('Account added');
      }
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    display: 'block', width: '100%',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 9, padding: '10px 13px',
    fontSize: 14, color: '#0f172a',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };
  const inpRO = { ...inp, background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#475569', cursor: 'default' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 6 };
  const focusIn  = (e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; e.target.style.background = '#fff'; };
  const focusOut = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };

  const banStatusColor = { Unbanned: '#059669', Banned: '#dc2626', New: '#2563eb' };
  const salesColor = { Sold: '#d97706', Unsold: '#64748b' };

  const CopyBtn = ({ text, id }) => (
    <button type="button" onClick={() => copyField(text, id)} style={{
      background: copied === id ? '#ecfdf5' : '#f1f5f9',
      border: '1px solid ' + (copied === id ? '#6ee7b7' : '#e2e8f0'),
      color: copied === id ? '#059669' : '#94a3b8',
      borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {copied === id
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
      }
    </button>
  );

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{
      background: '#f1f5f9', border: '1px solid #e2e8f0',
      color: '#64748b', borderRadius: 6, padding: '4px 10px',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
    }}>
      {show
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show</>
      }
    </button>
  );

  const titles    = { view: 'Account Details', add: 'Add New Account', edit: 'Edit Account' };
  const subtitles = { view: 'View credentials & info', add: 'Fill in account information', edit: 'Update account information' };

  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10, 14, 30, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box',
    }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', background: '#ffffff',
          borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
          animation: 'modalIn 0.25s cubic-bezier(0.22,0.68,0,1.2) both',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, background: '#ffffff', zIndex: 1, borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 19, color: '#0f172a' }}>{titles[mode]}</div>
              <div style={{ color: '#94a3b8', fontSize: 12.5, marginTop: 3 }}>{subtitles[mode]}</div>
            </div>
            <button type="button" onClick={onClose} style={{
              width: 34, height: 34, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
              color: '#94a3b8', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s', lineHeight: 1,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >✕</button>
          </div>

          {isView && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { label: account?.accountStatus, col: banStatusColor[account?.accountStatus] || '#64748b' },
                { label: account?.salesStatus,   col: salesColor[account?.salesStatus]       || '#64748b' },
              ].map((b, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: b.col + '18', color: b.col, border: '1px solid ' + b.col + '44' }}>{b.label}</span>
              ))}
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: '#eef2ff', color: '#4f46e5' }}>
                Level {account?.accountLevel}
              </span>
              {account?.rfrBought && (
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
                  RFR Bought
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status row */}
          {!isView && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Ban Status',   key: 'accountStatus', opts: ['New', 'Unbanned', 'Banned'] },
                { label: 'Sales Status', key: 'salesStatus',   opts: ['Unsold', 'Sold'] },
              ].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <select value={form[f.key]} onChange={set(f.key)} style={{ ...inp, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Email Address {!isView && <span style={{ color: '#ef4444' }}>*</span>}</label>
              {isView && <CopyBtn text={form.accountEmail} id="email" />}
            </div>
            {isView
              ? <div style={{ ...inpRO, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{form.accountEmail || '—'}</div>
              : <input type="email" value={form.accountEmail} onChange={set('accountEmail')} placeholder="email@example.com" style={inp} onFocus={focusIn} onBlur={focusOut} />
            }
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Password {!isView && <span style={{ color: '#ef4444' }}>*</span>}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <EyeBtn show={showPw} onToggle={() => setShowPw(p => !p)} />
                {isView && <CopyBtn text={form.accountPassword} id="pw" />}
              </div>
            </div>
            {isView
              ? <div style={{ ...inpRO, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, letterSpacing: showPw ? 0.5 : 2 }}>
                  {showPw ? form.accountPassword : '••••••••••••'}
                </div>
              : <input type={showPw ? 'text' : 'password'} value={form.accountPassword} onChange={set('accountPassword')} placeholder="Account password" style={inp} onFocus={focusIn} onBlur={focusOut} />
            }
          </div>

          {/* Additional Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Additional Password <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: 6 }}>
                {form.additionalAccountPassword && <EyeBtn show={showAddPw} onToggle={() => setShowAddPw(p => !p)} />}
                {isView && form.additionalAccountPassword && <CopyBtn text={form.additionalAccountPassword} id="addpw" />}
              </div>
            </div>
            {isView
              ? <div style={{ ...inpRO, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                  {form.additionalAccountPassword ? (showAddPw ? form.additionalAccountPassword : '••••••••••••') : '—'}
                </div>
              : <input type={showAddPw ? 'text' : 'password'} value={form.additionalAccountPassword} onChange={set('additionalAccountPassword')} placeholder="Optional" style={inp} onFocus={focusIn} onBlur={focusOut} />
            }
          </div>

          {/* Recovery + Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Recovery Email</label>
                {isView && form.accountRecovery && <CopyBtn text={form.accountRecovery} id="rec" />}
              </div>
              {isView
                ? <div style={{ ...inpRO, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{form.accountRecovery || '—'}</div>
                : <input value={form.accountRecovery} onChange={set('accountRecovery')} placeholder="recovery@example.com" style={inp} onFocus={focusIn} onBlur={focusOut} />
              }
            </div>
            <div>
              <label style={lbl}>Level</label>
              {isView
                ? <div style={{ ...inpRO, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: '#4f46e5', textAlign: 'center', fontSize: 20 }}>{form.accountLevel}</div>
                : <input type="number" min={1} max={9999} value={form.accountLevel}
                    onChange={e => setForm(f => ({ ...f, accountLevel: parseInt(e.target.value) || 1 }))}
                    style={inp} onFocus={focusIn} onBlur={focusOut}
                  />
              }
            </div>
          </div>

          {/* RFR Bought toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: form.rfrBought ? '#fffbeb' : '#f8fafc', borderRadius: 10, border: `1.5px solid ${form.rfrBought ? '#fcd34d' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>RFR Bought (Level 20 Purchased)</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Account reached level 20 by purchase, not grind</div>
            </div>
            {isView
              ? <span style={{ fontSize: 13, fontWeight: 700, color: form.rfrBought ? '#b45309' : '#94a3b8' }}>{form.rfrBought ? 'Yes' : 'No'}</span>
              : <button type="button" onClick={() => setForm(f => ({ ...f, rfrBought: !f.rfrBought }))} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.rfrBought ? '#f59e0b' : '#e2e8f0', transition: 'background 0.2s',
                  position: 'relative', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', top: 3, left: form.rfrBought ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                  }} />
                </button>
            }
          </div>

          {/* Price + Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Price (Rs)</label>
              {isView
                ? <div style={{ ...inpRO, fontFamily: "'JetBrains Mono',monospace", color: '#d97706', fontWeight: 700 }}>
                    {form.price > 0 ? 'Rs ' + Number(form.price).toLocaleString('en-PK') : '—'}
                  </div>
                : <input type="number" min={0} step={1} value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0" style={inp} onFocus={focusIn} onBlur={focusOut}
                  />
              }
            </div>
            <div>
              <label style={lbl}>Notes</label>
              {isView
                ? <div style={inpRO}>{form.notes || '—'}</div>
                : <input value={form.notes} onChange={set('notes')} placeholder="Optional notes…" style={inp} onFocus={focusIn} onBlur={focusOut} />
              }
            </div>
          </div>

          {isView && account?.createdAt && (
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#94a3b8', border: '1px solid #f1f5f9' }}>
              Added on {new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          {/* Footer buttons */}
          {isView && (
            <button type="button" onClick={onClose} style={{
              width: '100%', padding: '13px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', color: 'white',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)', transition: 'all 0.15s', fontFamily: 'inherit',
            }}>Close</button>
          )}

          {!isView && (
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '13px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#64748b',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
              >Cancel</button>

              <button type="button" onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '13px', borderRadius: 9, fontSize: 14, fontWeight: 700,
                background: saving ? '#a5b4fc' : isEdit ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'linear-gradient(135deg, #059669, #10b981)',
                border: 'none', color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : isEdit ? '0 4px 14px rgba(37,99,235,0.35)' : '0 4px 14px rgba(5,150,105,0.35)',
                transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              }}>
                {saving
                  ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving…</>
                  : isEdit ? '✓ Save Changes' : '+ Add Account'
                }
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
