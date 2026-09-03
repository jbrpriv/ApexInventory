import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import RankBadge, { RANKS } from './RankBadge';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Copy, Check, ChevronRight, ChevronLeft, Shield, Gamepad2, Tag, AlertCircle } from 'lucide-react';

const EMPTY = { accountStatus:'Unbanned', accountEmail:'', accountPassword:'', additionalAccountPassword:'', accountRecovery:'', accountLevel:1, salesStatus:'Unsold', notes:'', price:0, rfrBought:false, rank:'Unranked', apexUsername:'', apexPlatform:'PC' };

export default function AccountModal({ account, mode, onClose, onSaved }) {
  const isView = mode === 'view', isAdd = mode === 'add', isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [copied, setCopied] = useState('');
  const [step, setStep] = useState(0); // 0: Credentials, 1: Game Details, 2: Market Status

  useEffect(() => {
    if (isAdd) { setForm(EMPTY); setShowPw(false); setStep(0); }
    else if (account && (isView||isEdit)) {
      setForm({ accountStatus:account.accountStatus||'Unbanned', accountEmail:account.accountEmail||'', accountPassword:account.accountPassword||'', additionalAccountPassword:account.additionalAccountPassword||'', accountRecovery:account.accountRecovery||'', accountLevel:account.accountLevel||1, salesStatus:account.salesStatus||'Unsold', notes:account.notes||'', price:account.price||0, rfrBought:account.rfrBought||false, rank:account.rank||'Unranked', apexUsername:account.apexUsername||'', apexPlatform:account.apexPlatform||'PC' });
      setShowPw(isView); setShowAddPw(false);
      if (isEdit) setStep(0);
    }
    setSaving(false);
  }, [account, mode]);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const copyField = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500); toast.success('Copied!', { duration: 900 }); };

  const handleSave = async () => {
    if (!form.accountEmail.trim()) { toast.error('Email is required'); setStep(0); return; }
    if (!form.accountPassword.trim()) { toast.error('Password is required'); setStep(0); return; }
    setSaving(true);
    try {
      if (isEdit) { await updateAccount(account._id, form); toast.success('Account updated'); }
      else { await createAccount(form); toast.success('Account added'); }
      onSaved();
    } catch(err) { toast.error(err?.response?.data?.message || err?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Styles ── */
  const inp = { display:'block', width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', fontSize:14, color:'var(--text)', outline:'none', transition:'all 0.18s' };
  const inpRO = { ...inp, background:'var(--surface3)', color:'var(--text3)', cursor:'default', userSelect:'all' };
  const lbl = { display:'block', fontSize:11.5, fontWeight:600, color:'var(--text3)', letterSpacing:0.3, textTransform:'uppercase', marginBottom:8 };
  const fi = e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='var(--primary-glow)'; e.target.style.background='var(--surface)'; };
  const fo = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; e.target.style.background='var(--surface2)'; };

  const CopyBtn = ({ text, id }) => (
    <button type="button" onClick={() => copyField(text, id)}
      style={{ background:'transparent', border:'none', color:copied===id?'var(--emerald)':'var(--text4)', cursor:'pointer', display:'inline-flex', alignItems:'center', padding:4, borderRadius:4, transition:'all 0.15s' }}>
      {copied === id ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle}
      style={{ background:'transparent', border:'none', color:'var(--text4)', cursor:'pointer', display:'inline-flex', alignItems:'center', padding:4, borderRadius:4 }}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const TIER_BTN = {
    Unranked: { sel:'#64748b', selBg:'var(--slate-bg)', selBorder:'var(--slate-b)' },
    Bronze:   { sel:'#92400e', selBg:'var(--amber-bg)', selBorder:'var(--amber-b)' },
    Silver:   { sel:'#374151', selBg:'var(--slate-bg)', selBorder:'var(--slate-b)' },
    Gold:     { sel:'#92400e', selBg:'var(--amber-bg)', selBorder:'var(--amber-b)' },
    Platinum: { sel:'#0e7490', selBg:'var(--sky-bg)',   selBorder:'var(--sky-b)' },
    Diamond:  { sel:'#1d4ed8', selBg:'var(--sky-bg)',   selBorder:'rgba(29,78,216,0.3)' },
    Master:   { sel:'#7c3aed', selBg:'var(--violet-bg)',selBorder:'var(--violet-b)' },
    Predator: { sel:'#e11d48', selBg:'var(--rose-bg)',  selBorder:'var(--rose-b)' },
  };

  const STEPS = [
    { id: 0, title: 'Credentials', icon: <Shield size={18} /> },
    { id: 1, title: 'Game Info', icon: <Gamepad2 size={18} /> },
    { id: 2, title: 'Market Data', icon: <Tag size={18} /> },
  ];

  /* ── Step Components ── */
  const StepCredentials = () => (
    <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} transition={{duration:0.2}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Email */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
          <label style={{...lbl,marginBottom:0}}>Email {(!isView) && <span style={{color:'var(--rose)'}}>*</span>}</label>
          {isView && <CopyBtn text={form.accountEmail} id="email" />}
        </div>
        {isView ? <div style={inpRO}>{form.accountEmail || '—'}</div>
          : <input type="email" value={form.accountEmail} onChange={setF('accountEmail')} placeholder="account@example.com" style={inp} onFocus={fi} onBlur={fo} />}
      </div>

      {/* Password */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
          <label style={{...lbl,marginBottom:0}}>Password {(!isView) && <span style={{color:'var(--rose)'}}>*</span>}</label>
          <div style={{display:'flex',gap:2}}><EyeBtn show={showPw} onToggle={()=>setShowPw(!showPw)} />{isView && <CopyBtn text={form.accountPassword} id="pw" />}</div>
        </div>
        {isView ? <div style={{...inpRO, fontFamily: showPw?'var(--font-body)':'var(--font-mono)'}}>{showPw ? form.accountPassword : '••••••••••••'}</div>
          : <input type={showPw?'text':'password'} value={form.accountPassword} onChange={setF('accountPassword')} placeholder="Required" style={inp} onFocus={fi} onBlur={fo} />}
      </div>

      {/* Additional & Recovery */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <label style={{...lbl,marginBottom:0}}>Pin / Extra Pw</label>
            <div style={{display:'flex',gap:2}}>{(form.additionalAccountPassword || !isView) && <EyeBtn show={showAddPw} onToggle={()=>setShowAddPw(!showAddPw)} />}{isView && form.additionalAccountPassword && <CopyBtn text={form.additionalAccountPassword} id="addpw" />}</div>
          </div>
          {isView ? <div style={{...inpRO, fontFamily: showAddPw?'var(--font-body)':'var(--font-mono)'}}>{form.additionalAccountPassword ? (showAddPw?form.additionalAccountPassword:'••••••••••••') : '—'}</div>
            : <input type={showAddPw?'text':'password'} value={form.additionalAccountPassword} onChange={setF('additionalAccountPassword')} placeholder="Optional" style={inp} onFocus={fi} onBlur={fo} />}
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <label style={{...lbl,marginBottom:0}}>Recovery</label>
            {isView && form.accountRecovery && <CopyBtn text={form.accountRecovery} id="rec" />}
          </div>
          {isView ? <div style={inpRO}>{form.accountRecovery || '—'}</div>
            : <input value={form.accountRecovery} onChange={setF('accountRecovery')} placeholder="recovery@example.com" style={inp} onFocus={fi} onBlur={fo} />}
        </div>
      </div>
    </motion.div>
  );

  const StepGame = () => (
    <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} transition={{duration:0.2}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Rank & Level */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'end' }}>
        <div>
          <label style={lbl}>Current Rank</label>
          {isView ? (
            <div style={{padding:'8px 14px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)', display:'flex'}}><RankBadge rank={form.rank}/></div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {RANKS.map(r=>{
                const tier=(r==='Unranked'||r==='Master'||r==='Predator')?r:r.split(' ')[0];
                const tc=TIER_BTN[tier]||TIER_BTN.Unranked;
                const sel=form.rank===r;
                return <button key={r} type="button" onClick={()=>setForm(f=>({...f,rank:r}))} style={{ padding:'8px 4px',borderRadius:6,fontSize:11,fontWeight:sel?600:500,border:`1px solid ${sel?tc.selBorder:'transparent'}`,background:sel?tc.selBg:'var(--surface2)',color:sel?tc.sel:'var(--text4)',cursor:'pointer',transition:'all 0.15s',textAlign:'center' }}>{r}</button>;
              })}
            </div>
          )}
        </div>
        <div>
          <label style={lbl}>Level</label>
          {isView ? <div style={{...inpRO, fontWeight:700, textAlign:'center', color:'var(--primary)'}}>{form.accountLevel}</div>
            : <input type="number" min={1} value={form.accountLevel} onChange={e=>setForm(f=>({...f,accountLevel:parseInt(e.target.value)||1}))} style={{...inp, width:80, textAlign:'center', fontWeight:600}} onFocus={fi} onBlur={fo} />}
        </div>
      </div>

      {/* RFR Origin */}
      <div>
        <label style={lbl}>Level 20 Origin</label>
        {isView ? (
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:8,background:form.rfrBought?'var(--amber-bg)':'var(--emerald-bg)',border:`1px solid ${form.rfrBought?'var(--amber-b)':'var(--emerald-b)'}`}}>
            <div style={{color:form.rfrBought?'var(--amber)':'var(--emerald)'}}>{form.rfrBought ? <Tag size={20}/> : <Gamepad2 size={20}/>}</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:form.rfrBought?'var(--amber)':'var(--emerald)'}}>{form.rfrBought?'Bought/Boosted RFR':'Made By Me'}</div>
              <div style={{fontSize:12.5,color:'var(--text3)'}}>{form.rfrBought?'Account was purchased from external source':'Account was artificially grown directly'}</div>
            </div>
          </div>
        ) : (
          <div style={{display:'flex',gap:10}}>
            <button type="button" onClick={()=>setForm(f=>({...f,rfrBought:false}))} style={{flex:1,padding:'12px',borderRadius:8,textAlign:'left',border:`1px solid ${!form.rfrBought?'var(--emerald-b)':'var(--border)'}`,background:!form.rfrBought?'var(--emerald-bg)':'var(--surface2)',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,color:!form.rfrBought?'var(--emerald)':'var(--text4)'}}><Gamepad2 size={16}/><span style={{fontWeight:600}}>Self-Made</span></div>
              <div style={{fontSize:11.5,color:'var(--text4)',marginTop:4}}>Natural level progression</div>
            </button>
            <button type="button" onClick={()=>setForm(f=>({...f,rfrBought:true}))} style={{flex:1,padding:'12px',borderRadius:8,textAlign:'left',border:`1px solid ${form.rfrBought?'var(--amber-b)':'var(--border)'}`,background:form.rfrBought?'var(--amber-bg)':'var(--surface2)',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,color:form.rfrBought?'var(--amber)':'var(--text4)'}}><Tag size={16}/><span style={{fontWeight:600}}>Bought</span></div>
              <div style={{fontSize:11.5,color:'var(--text4)',marginTop:4}}>Purchased ready for rank</div>
            </button>
          </div>
        )}
      </div>

      {/* Sync */}
      <div style={{ padding:16, border:'1px solid var(--border)', borderRadius:8, background:'var(--surface2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <AlertCircle size={16} color="var(--primary)" />
          <span style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>Apex Legends Sync</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 100px',gap:12}}>
          <div>
            <label style={lbl}>Username</label>
            {isView ? (
              <div style={{...inpRO, display:'flex', alignItems:'center', gap:8}}>
                <span style={{color:'var(--primary)', fontWeight:500}}>{form.apexUsername || 'Not linked'}</span>
              </div>
            ) : <input value={form.apexUsername} onChange={setF('apexUsername')} placeholder="in-game name" style={inp} onFocus={fi} onBlur={fo} />}
          </div>
          <div>
            <label style={lbl}>Platform</label>
            {isView ? <div style={{...inpRO, textAlign:'center', fontWeight:600}}>{form.apexPlatform}</div>
              : <select value={form.apexPlatform} onChange={setF('apexPlatform')} style={{...inp, cursor:'pointer'}} onFocus={fi} onBlur={fo}><option>PC</option><option>PS4</option><option value="X1">Xbox</option></select>}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const StepMarket = () => (
    <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} transition={{duration:0.2}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Ban & Sales Status */}
      {(!isView) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <label style={lbl}>Account Standing</label>
            <select value={form.accountStatus} onChange={setF('accountStatus')} style={{...inp, cursor:'pointer', color:form.accountStatus==='Banned'?'var(--rose)':'var(--text)'}} onFocus={fi} onBlur={fo}>
              <option value="Unbanned">Cleaned (Unbanned)</option>
              <option value="Banned">Banned</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Sales Status</label>
            <select value={form.salesStatus} onChange={setF('salesStatus')} style={{...inp, cursor:'pointer'}} onFocus={fi} onBlur={fo}>
              <option value="Unsold">Available (Unsold)</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
      )}

      {isView && (
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ flex:1, padding:14, borderRadius:8, background:form.accountStatus==='Banned'?'var(--rose-bg)':'var(--emerald-bg)', border:`1px solid ${form.accountStatus==='Banned'?'var(--rose-b)':'var(--emerald-b)'}` }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5 }}>Standing</div>
            <div style={{ fontSize:16, fontWeight:600, color:form.accountStatus==='Banned'?'var(--rose)':'var(--emerald)', marginTop:4 }}>{form.accountStatus}</div>
          </div>
          <div style={{ flex:1, padding:14, borderRadius:8, background:form.salesStatus==='Sold'?'var(--amber-bg)':'var(--surface2)', border:`1px solid ${form.salesStatus==='Sold'?'var(--amber-b)':'var(--border)'}` }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.5 }}>Inventory</div>
            <div style={{ fontSize:16, fontWeight:600, color:form.salesStatus==='Sold'?'var(--amber)':'var(--text)', marginTop:4 }}>{form.salesStatus}</div>
          </div>
        </div>
      )}

      {/* Pricing & Notes */}
      <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:16}}>
        <div>
          <label style={lbl}>Price (RS)</label>
          {isView ? <div style={{...inpRO, fontWeight:600}}>{form.price>0 ? `Rs ${Number(form.price).toLocaleString()}` : '—'}</div>
            : <input type="number" min={0} value={form.price} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} placeholder="0" style={inp} onFocus={fi} onBlur={fo}/>}
        </div>
        <div>
          <label style={lbl}>Private Notes</label>
          {isView ? <div style={inpRO}>{form.notes || '—'}</div>
            : <input value={form.notes} onChange={setF('notes')} placeholder="Optional details..." style={inp} onFocus={fi} onBlur={fo}/>}
        </div>
      </div>
    </motion.div>
  );

  return ReactDOM.createPortal(
    <div className="modal-overlay fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', padding:20 }}>
      
      <motion.div className="modal-box"
        initial={{ opacity:0, scale:0.98, y:12 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ type:'spring', stiffness:400, damping:32 }}
        style={{ background:'var(--surface)', borderRadius:16, width:'100%', maxWidth:540, boxShadow:'var(--sh-xl), 0 0 0 1px var(--border)', overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'90vh' }}>
        
        {/* Header */}
        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid var(--border-sm)', position:'relative' }}>
          <button type="button" onClick={onClose} style={{ position:'absolute', top:22, right:24, width:32, height:32, borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--border)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='var(--surface2)'}}>
            <X size={16} />
          </button>
          
          <div style={{ fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' }}>
            {isView ? 'Account Overview' : isAdd ? 'New Account' : 'Edit Account'}
          </div>
          <div style={{ fontSize:13.5, color:'var(--text4)', marginTop:4 }}>
            {isView ? 'Complete details and synchronisation status.' : 'Step through the wizard to setup the profile.'}
          </div>

          {/* Stepper / Tabs */}
          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            {STEPS.map((s, idx) => {
              const active = step === idx;
              const passed = step > idx;
              return (
                <button key={s.id} onClick={() => (isView || passed) && setStep(s.id)} type="button"
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 0', borderBottom:`2px solid ${active?'var(--primary)':passed?'var(--border-hi)':'transparent'}`, color:active?'var(--primary)':passed?'var(--text2)':'var(--text4)', background:'transparent', borderTop:'none', borderLeft:'none', borderRight:'none', cursor:(isView||passed)?'pointer':'default', fontWeight:600, transition:'all 0.2s' }}>
                  {isView ? s.icon : (passed ? <Check size={16}/> : <span style={{fontSize:12}}>{s.id + 1}.</span>)}
                  <span style={{fontSize:13}}>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding:'28px', flex:1, overflowY:'auto' }}>
          <AnimatePresence mode="wait">
            {step === 0 && <StepCredentials key="step0" />}
            {step === 1 && <StepGame key="step1" />}
            {step === 2 && <StepMarket key="step2" />}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div style={{ padding:'20px 28px', borderTop:'1px solid var(--border-sm)', background:'var(--surface2)', display:'flex', justifyContent:'space-between', gap:12 }}>
          {isView ? (
            <button onClick={onClose} className="btn-primary" style={{ width:'100%', padding:'12px' }}>Close Viewer</button>
          ) : (
            <>
              <button type="button" onClick={() => step > 0 ? setStep(step - 1) : onClose()} style={{ padding:'0 20px', borderRadius:8, fontSize:14, fontWeight:600, background:'transparent', border:`1px solid var(--border)`, color:'var(--text2)', cursor:'pointer' }}>
                {step > 0 ? 'Back' : 'Cancel'}
              </button>
              
              <div style={{ display:'flex', gap:12, flex:1, justifyContent:'flex-end' }}>
                {step < 2 ? (
                  <>
                    <button type="button" onClick={() => setStep(step + 1)} style={{ padding:'11px 24px', borderRadius:8, fontSize:14, fontWeight:600, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                      Skip
                    </button>
                    <button type="button" onClick={() => setStep(step + 1)} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}>
                      Next <ChevronRight size={16} />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Account')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
