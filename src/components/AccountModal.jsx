import React, { useState, useEffect } from 'react';
import { createAccount, updateAccount } from '../api';
import toast from 'react-hot-toast';

const EMPTY = {
  accountStatus: 'New', accountEmail: '', accountPassword: '',
  additionalAccountPassword: '', accountRecovery: '',
  accountLevel: 1, salesStatus: 'Unsold', notes: '', price: 0,
};

const labelStyle = { display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:1, textTransform:'uppercase', marginBottom:5 };
const iStyle = { background:'var(--bg3)', border:'1.5px solid var(--border-md)', borderRadius:8, color:'var(--text)', padding:'10px 13px', fontSize:14, fontFamily:'inherit', outline:'none', width:'100%', transition:'border-color 0.18s, box-shadow 0.18s' };
const iReadStyle = { ...iStyle, background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text2)', cursor:'default' };

export default function AccountModal({ account, mode, onClose, onSaved }) {
  // mode: 'view' | 'add' | 'edit'
  const isView = mode === 'view';
  const isAdd  = mode === 'add';
  const isEdit = mode === 'edit';
  const readOnly = isView;

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (account && (isView || isEdit)) {
      setForm({
        accountStatus: account.accountStatus || 'New',
        accountEmail: account.accountEmail || '',
        accountPassword: account.accountPassword || '',
        additionalAccountPassword: account.additionalAccountPassword || '',
        accountRecovery: account.accountRecovery || '',
        accountLevel: account.accountLevel || 1,
        salesStatus: account.salesStatus || 'Unsold',
        notes: account.notes || '',
        price: account.price || 0,
      });
    } else if (isAdd) {
      setForm(EMPTY);
    }
    setShowPw(isView); // show pw in view mode by default
  }, [account, mode]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const copyField = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 1500);
    toast.success('Copied!', { duration: 900 });
  };

  const handleSave = async () => {
    if (!form.accountEmail.trim()) return toast.error('Email is required');
    if (!form.accountPassword.trim()) return toast.error('Password is required');
    setSaving(true);
    try {
      if (isEdit) { await updateAccount(account._id, form); toast.success('Account updated'); }
      else        { await createAccount(form); toast.success('Account added'); }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const titles = { view:'Account Details', add:'Add New Account', edit:'Edit Account' };
  const subtitles = { view:'View credentials', add:'Fill in account information', edit:'Update account information' };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copyField(text, id)} title="Copy to clipboard" style={{
      background: copied === id ? 'var(--green-bg)' : 'var(--bg)',
      border: '1px solid ' + (copied === id ? 'var(--green-b)' : 'var(--border-md)'),
      color: copied === id ? 'var(--green)' : 'var(--text3)',
      borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.18s', display:'flex', alignItems:'center', gap:4,
    }}>
      {copied === id ? (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
      )}
    </button>
  );

  const EyeBtn = ({ show, onToggle }) => (
    <button onClick={onToggle} title={show ? 'Hide' : 'Show'} style={{
      background: 'var(--bg)', border: '1px solid var(--border-md)',
      color: 'var(--text3)', borderRadius: 6, padding: '4px 10px',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.18s',
    }}>
      {show ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show</>
      )}
    </button>
  );

  const statusColors = { Unbanned:'var(--green)', Banned:'var(--red)', New:'var(--blue)', Sold:'var(--amber)', Unsold:'var(--slate)' };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(15,23,42,0.55)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} className="scale-in" style={{
        background:'white', borderRadius:20, width:'100%', maxWidth:560,
        boxShadow:'var(--sh-xl)', maxHeight:'92vh', overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'white', zIndex:1, borderRadius:'20px 20px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:19, color:'var(--text)' }}>{titles[mode]}</div>
              <div style={{ color:'var(--text3)', fontSize:12.5, marginTop:2 }}>{subtitles[mode]}</div>
            </div>
            <button onClick={onClose} style={{
              width:34, height:34, borderRadius:8, background:'var(--bg3)',
              border:'1px solid var(--border)', color:'var(--text3)', fontSize:15,
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              flexShrink:0, transition:'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text3)'; }}
            >✕</button>
          </div>

          {/* Status badges in view mode */}
          {isView && (
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
              {[
                { label: account?.accountStatus, key: 'accountStatus' },
                { label: account?.salesStatus,   key: 'salesStatus' },
              ].map(b => (
                <span key={b.key} style={{
                  padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:600,
                  background: statusColors[b.label] + '18',
                  color: statusColors[b.label],
                  border: '1px solid ' + statusColors[b.label] + '44',
                }}>{b.label}</span>
              ))}
              <span style={{ padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:600, background:'var(--primary-pale)', color:'var(--primary)' }}>
                Level {account?.accountLevel}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Status row (edit/add only) */}
          {!isView && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Account Status', key:'accountStatus', opts:['New','Unbanned','Banned'] },
                { label:'Sales Status',   key:'salesStatus',   opts:['Unsold','Sold'] },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <select value={form[f.key]} onChange={set(f.key)} style={iStyle}
                    onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                    onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
                  >
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <label style={{ ...labelStyle, marginBottom:0 }}>Email Address {!isView && '*'}</label>
              {isView && <CopyBtn text={form.accountEmail} id="email"/>}
            </div>
            {isView ? (
              <div style={{ ...iReadStyle, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{form.accountEmail || '—'}</div>
            ) : (
              <input value={form.accountEmail} onChange={set('accountEmail')} placeholder="email@example.com" style={iStyle}
                onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
              />
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <label style={{ ...labelStyle, marginBottom:0 }}>Password {!isView && '*'}</label>
              <div style={{ display:'flex', gap:6 }}>
                <EyeBtn show={showPw} onToggle={() => setShowPw(p => !p)}/>
                {isView && <CopyBtn text={form.accountPassword} id="pw"/>}
              </div>
            </div>
            {isView ? (
              <div style={{ ...iReadStyle, fontFamily:"'JetBrains Mono',monospace", fontSize:13, letterSpacing: showPw ? 0.5 : 2 }}>
                {showPw ? form.accountPassword : '••••••••••••'}
              </div>
            ) : (
              <input type={showPw ? 'text' : 'password'} value={form.accountPassword} onChange={set('accountPassword')} placeholder="Account password" style={iStyle}
                onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
              />
            )}
          </div>

          {/* Additional Password */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <label style={{ ...labelStyle, marginBottom:0 }}>Additional Password</label>
              <div style={{ display:'flex', gap:6 }}>
                {form.additionalAccountPassword && <EyeBtn show={showAddPw} onToggle={() => setShowAddPw(p => !p)}/>}
                {isView && form.additionalAccountPassword && <CopyBtn text={form.additionalAccountPassword} id="addpw"/>}
              </div>
            </div>
            {isView ? (
              <div style={{ ...iReadStyle, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
                {form.additionalAccountPassword ? (showAddPw ? form.additionalAccountPassword : '••••••••••••') : '—'}
              </div>
            ) : (
              <input type={showAddPw ? 'text' : 'password'} value={form.additionalAccountPassword} onChange={set('additionalAccountPassword')} placeholder="Optional" style={iStyle}
                onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
              />
            )}
          </div>

          {/* Recovery + Level */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px', gap:12 }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <label style={{ ...labelStyle, marginBottom:0 }}>Recovery Email</label>
                {isView && form.accountRecovery && <CopyBtn text={form.accountRecovery} id="rec"/>}
              </div>
              {isView ? (
                <div style={{ ...iReadStyle, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{form.accountRecovery || '—'}</div>
              ) : (
                <input value={form.accountRecovery} onChange={set('accountRecovery')} placeholder="recovery@example.com" style={iStyle}
                  onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
                />
              )}
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              {isView ? (
                <div style={{ ...iReadStyle, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'var(--primary)', textAlign:'center', fontSize:18 }}>{form.accountLevel}</div>
              ) : (
                <input type="number" min={1} max={999} value={form.accountLevel} onChange={e => setForm(f => ({ ...f, accountLevel: parseInt(e.target.value)||1 }))} style={iStyle}
                  onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
                />
              )}
            </div>
          </div>

          {/* Price + Notes */}
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Price ($)</label>
              {isView ? (
                <div style={{ ...iReadStyle, fontFamily:"'JetBrains Mono',monospace", color:'var(--amber)', fontWeight:600 }}>
                  {form.price > 0 ? '$' + Number(form.price).toFixed(2) : '—'}
                </div>
              ) : (
                <input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value)||0 }))} style={iStyle}
                  onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
                />
              )}
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              {isView ? (
                <div style={{ ...iReadStyle }}>{form.notes || '—'}</div>
              ) : (
                <input value={form.notes} onChange={set('notes')} placeholder="Optional notes..." style={iStyle}
                  onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none'; }}
                />
              )}
            </div>
          </div>

          {/* Created at in view mode */}
          {isView && account?.createdAt && (
            <div style={{ padding:'10px 14px', background:'var(--bg3)', borderRadius:8, fontSize:12, color:'var(--text3)' }}>
              Added on {new Date(account.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
            </div>
          )}

          {/* Footer Actions */}
          {isView && (
            <button onClick={onClose} className="btn-primary" style={{ width:'100%', padding:'12px' }}>Close</button>
          )}
          {!isView && (
            <div style={{ display:'flex', gap:10, paddingTop:4 }}>
              <button onClick={onClose} className="btn-ghost" style={{ flex:1, padding:'12px' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex:2, padding:'12px', borderRadius:8, fontSize:14, fontWeight:700,
                background: saving ? 'var(--border-md)' : 'var(--primary)',
                border:'none', color:'white', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 2px 10px var(--primary-glow)',
                transition:'all 0.18s',
              }}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
