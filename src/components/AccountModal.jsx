import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import RankBadge, { RANKS } from './RankBadge';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const EMPTY = { accountStatus:'Unbanned', accountEmail:'', accountPassword:'', additionalAccountPassword:'', accountRecovery:'', accountLevel:1, salesStatus:'Unsold', notes:'', price:0, rfrBought:false, rank:'Unranked', apexUsername:'', apexPlatform:'PC' };

export default function AccountModal({ account, mode, onClose, onSaved }) {
  const isView=mode==='view', isAdd=mode==='add', isEdit=mode==='edit';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isAdd) { setForm(EMPTY); setShowPw(false); }
    else if (account && (isView||isEdit)) {
      setForm({ accountStatus:account.accountStatus||'Unbanned', accountEmail:account.accountEmail||'', accountPassword:account.accountPassword||'', additionalAccountPassword:account.additionalAccountPassword||'', accountRecovery:account.accountRecovery||'', accountLevel:account.accountLevel||1, salesStatus:account.salesStatus||'Unsold', notes:account.notes||'', price:account.price||0, rfrBought:account.rfrBought||false, rank:account.rank||'Unranked', apexUsername:account.apexUsername||'', apexPlatform:account.apexPlatform||'PC' });
      setShowPw(isView); setShowAddPw(false);
    }
    setSaving(false);
  }, [account, mode]);

  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const copyField = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(''),1500); toast.success('Copied!',{duration:900}); };

  const handleSave = async () => {
    if (!form.accountEmail.trim()) return toast.error('Email is required');
    if (!form.accountPassword.trim()) return toast.error('Password is required');
    setSaving(true);
    try {
      if (isEdit) { await updateAccount(account._id, form); toast.success('Account updated'); }
      else { await createAccount(form); toast.success('Account added'); }
      onSaved();
    } catch(err) { toast.error(err?.response?.data?.message||err?.message||'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Styles ─────────────────────────────────────────── */
  const inp = { display:'block', width:'100%', background:'#F5F0EB', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:9, padding:'10px 13px', fontSize:14, color:'#1C1917', fontFamily:'var(--font-body)', outline:'none', transition:'all 0.18s', boxSizing:'border-box' };
  const inpRO = { ...inp, background:'#EDE8E3', color:'#78716C', cursor:'default' };
  const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#78716C', letterSpacing:0.8, textTransform:'uppercase', marginBottom:6 };
  const fi = e => { e.target.style.borderColor='#ea580c'; e.target.style.boxShadow='0 0 0 3px rgba(234,88,12,0.1)'; e.target.style.background='#fff'; };
  const fo = e => { e.target.style.borderColor='rgba(0,0,0,0.1)'; e.target.style.boxShadow='none'; e.target.style.background='#F5F0EB'; };

  const isBanned = form.accountStatus==='Banned';

  const CopyBtn = ({text,id}) => (
    <button type="button" onClick={()=>copyField(text,id)}
      style={{ background:copied===id?'rgba(22,163,74,0.1)':'rgba(0,0,0,0.06)', border:`1px solid ${copied===id?'rgba(22,163,74,0.3)':'rgba(0,0,0,0.1)'}`, color:copied===id?'#16a34a':'#78716C', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:4 }}>
      {copied===id?<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>:<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );

  const EyeBtn = ({show,onToggle}) => (
    <button type="button" onClick={onToggle}
      style={{ background:'rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.1)', color:'#78716C', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3, transition:'all 0.15s' }}>
      {show?<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide</>:<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show</>}
    </button>
  );

  const TIER_BTN = {
    Unranked: { sel:'#64748b', selBg:'rgba(100,116,139,0.1)', selBorder:'rgba(100,116,139,0.3)' },
    Bronze:   { sel:'#92400e', selBg:'rgba(180,83,9,0.1)',   selBorder:'rgba(180,83,9,0.3)'   },
    Silver:   { sel:'#374151', selBg:'rgba(55,65,81,0.08)',  selBorder:'rgba(55,65,81,0.2)'   },
    Gold:     { sel:'#92400e', selBg:'rgba(217,119,6,0.1)',  selBorder:'rgba(217,119,6,0.3)'  },
    Platinum: { sel:'#0e7490', selBg:'rgba(14,116,144,0.1)', selBorder:'rgba(14,116,144,0.3)' },
    Diamond:  { sel:'#1d4ed8', selBg:'rgba(29,78,216,0.1)',  selBorder:'rgba(29,78,216,0.3)'  },
    Master:   { sel:'#7c3aed', selBg:'rgba(124,58,237,0.1)', selBorder:'rgba(124,58,237,0.3)' },
    Predator: { sel:'#e11d48', selBg:'rgba(225,29,72,0.1)',  selBorder:'rgba(225,29,72,0.3)'  },
  };

  const modal = (
    <div className="modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(6px)', display:'flex', justifyContent:'center', padding:20 }}
    >
      <motion.div className="modal-box" onClick={e=>e.stopPropagation()}
        initial={{ opacity:0, scale:0.94, y:16 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        style={{ background:'#FFFFFF', borderRadius:20, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid rgba(0,0,0,0.07)', position:'sticky', top:0, background:'#FFFFFF', zIndex:1, borderRadius:'20px 20px 0 0' }}>
          {/* Orange top line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#ea580c,#f97316,transparent)', borderRadius:'20px 20px 0 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:19, color:'#1C1917' }}>
                {isView?'Account Details':isAdd?'Add New Account':'Edit Account'}
              </div>
              <div style={{ color:'#78716C', fontSize:13, marginTop:3 }}>
                {isView?'View credentials & info':isAdd?'Fill in account information':'Update account information'}
              </div>
            </div>
            <button type="button" onClick={onClose}
              style={{ width:32, height:32, borderRadius:8, background:'#F5F0EB', border:'1px solid rgba(0,0,0,0.1)', color:'#78716C', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', minHeight:'auto', minWidth:'auto' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(225,29,72,0.1)';e.currentTarget.style.color='#e11d48';e.currentTarget.style.borderColor='rgba(225,29,72,0.25)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#F5F0EB';e.currentTarget.style.color='#78716C';e.currentTarget.style.borderColor='rgba(0,0,0,0.1)';}}
            >✕</button>
          </div>

          {isView && (
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:isBanned?'rgba(225,29,72,0.1)':'rgba(22,163,74,0.1)', color:isBanned?'#e11d48':'#16a34a', border:`1px solid ${isBanned?'rgba(225,29,72,0.25)':'rgba(22,163,74,0.25)'}`, display:'inline-flex', alignItems:'center', gap:5 }}>
                {isBanned?<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {isBanned?'Banned':'Unbanned'}
              </span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:form.salesStatus==='Sold'?'rgba(217,119,6,0.1)':'rgba(100,116,139,0.08)', color:form.salesStatus==='Sold'?'#d97706':'#64748b', border:`1px solid ${form.salesStatus==='Sold'?'rgba(217,119,6,0.25)':'rgba(100,116,139,0.2)'}` }}>{form.salesStatus}</span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:'rgba(234,88,12,0.1)', color:'#ea580c', border:'1px solid rgba(234,88,12,0.2)' }}>Level {form.accountLevel}</span>
              <RankBadge rank={form.rank} />
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {!isView && (
            <div>
              <label style={lbl}>Ban Status</label>
              <div style={{ display:'flex', gap:10 }}>
                {[{val:'Unbanned',icon:'✅',label:'Unbanned',col:'#16a34a',bg:'rgba(22,163,74,0.08)',border:'rgba(22,163,74,0.3)'},{val:'Banned',icon:'🚫',label:'Banned',col:'#e11d48',bg:'rgba(225,29,72,0.08)',border:'rgba(225,29,72,0.3)'}].map(opt=>{
                  const active=form.accountStatus===opt.val;
                  return <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,accountStatus:opt.val}))} style={{ flex:1,padding:'11px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${active?opt.border:'rgba(0,0,0,0.08)'}`,background:active?opt.bg:'#FAFAF9',cursor:'pointer',transition:'all 0.18s' }}>
                    <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:600,color:active?opt.col:'#A8A29E'}}>{opt.label}</div>
                  </button>;
                })}
              </div>
            </div>
          )}

          {!isView && (
            <div>
              <label style={lbl}>Sales Status</label>
              <div style={{display:'flex',gap:10}}>
                {[{val:'Unsold',icon:'🏪',label:'Unsold',col:'#64748b',bg:'rgba(100,116,139,0.08)',border:'rgba(100,116,139,0.25)'},{val:'Sold',icon:'💰',label:'Sold',col:'#d97706',bg:'rgba(217,119,6,0.08)',border:'rgba(217,119,6,0.3)'}].map(opt=>{
                  const active=form.salesStatus===opt.val;
                  return <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,salesStatus:opt.val}))} style={{flex:1,padding:'11px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${active?opt.border:'rgba(0,0,0,0.08)'}`,background:active?opt.bg:'#FAFAF9',cursor:'pointer',transition:'all 0.18s'}}>
                    <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:600,color:active?opt.col:'#A8A29E'}}>{opt.label}</div>
                  </button>;
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Email {!isView&&<span style={{color:'#e11d48'}}>*</span>}</label>
              {isView&&<CopyBtn text={form.accountEmail} id="email"/>}
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.accountEmail||'—'}</div>
              :<input type="email" value={form.accountEmail} onChange={set('accountEmail')} placeholder="email@example.com" style={inp} onFocus={fi} onBlur={fo}/>}
          </div>

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Password {!isView&&<span style={{color:'#e11d48'}}>*</span>}</label>
              <div style={{display:'flex',gap:6}}><EyeBtn show={showPw} onToggle={()=>setShowPw(p=>!p)}/>{isView&&<CopyBtn text={form.accountPassword} id="pw"/>}</div>
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13,letterSpacing:showPw?0.5:2}}>{showPw?form.accountPassword:'••••••••••••'}</div>
              :<input type={showPw?'text':'password'} value={form.accountPassword} onChange={set('accountPassword')} placeholder="Account password" style={inp} onFocus={fi} onBlur={fo}/>}
          </div>

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Additional Password <span style={{fontSize:10,color:'#A8A29E',fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span></label>
              <div style={{display:'flex',gap:6}}>
                {(form.additionalAccountPassword||!isView)&&<EyeBtn show={showAddPw} onToggle={()=>setShowAddPw(p=>!p)}/>}
                {isView&&form.additionalAccountPassword&&<CopyBtn text={form.additionalAccountPassword} id="addpw"/>}
              </div>
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.additionalAccountPassword?(showAddPw?form.additionalAccountPassword:'••••••••••••'):'—'}</div>
              :<input type={showAddPw?'text':'password'} value={form.additionalAccountPassword} onChange={set('additionalAccountPassword')} placeholder="Optional" style={inp} onFocus={fi} onBlur={fo}/>}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 100px',gap:12}}>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{...lbl,marginBottom:0}}>Recovery Email</label>
                {isView&&form.accountRecovery&&<CopyBtn text={form.accountRecovery} id="rec"/>}
              </div>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.accountRecovery||'—'}</div>
                :<input value={form.accountRecovery} onChange={set('accountRecovery')} placeholder="recovery@example.com" style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
            <div>
              <label style={lbl}>Level</label>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-display)',fontWeight:700,color:'#ea580c',textAlign:'center',fontSize:22}}>{form.accountLevel}</div>
                :<input type="number" min={1} max={9999} value={form.accountLevel} onChange={e=>setForm(f=>({...f,accountLevel:parseInt(e.target.value)||1}))} style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
          </div>

          <div>
            <label style={lbl}>Rank</label>
            {isView
              ? <div style={{padding:'10px 14px',background:'#F5F0EB',borderRadius:9,border:'1px solid rgba(0,0,0,0.08)',display:'flex',alignItems:'center',gap:10}}><RankBadge rank={form.rank}/></div>
              : <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                  {RANKS.map(r=>{
                    const tier=(r==='Unranked'||r==='Master'||r==='Predator')?r:r.split(' ')[0];
                    const tc=TIER_BTN[tier]||TIER_BTN.Unranked;
                    const sel=form.rank===r;
                    return <button key={r} type="button" onClick={()=>setForm(f=>({...f,rank:r}))} style={{ padding:'7px 4px',borderRadius:7,fontSize:10.5,fontWeight:sel?700:500,border:`1px solid ${sel?tc.selBorder:'rgba(0,0,0,0.08)'}`,background:sel?tc.selBg:'#FAFAF9',color:sel?tc.sel:'#A8A29E',cursor:'pointer',transition:'all 0.15s',textAlign:'center' }}>{r}</button>;
                  })}
                </div>
            }
          </div>

          <div>
            <label style={lbl}>Level 20 Origin</label>
            {isView
              ? <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:form.rfrBought?'rgba(217,119,6,0.08)':'rgba(22,163,74,0.08)',border:`1px solid ${form.rfrBought?'rgba(217,119,6,0.25)':'rgba(22,163,74,0.25)'}`}}>
                  <span style={{fontSize:20}}>{form.rfrBought?'💰':'🎮'}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:form.rfrBought?'#92400e':'#16a34a'}}>{form.rfrBought?'RFR Bought':'Made It Myself'}</div>
                    <div style={{fontSize:12.5,color:'#78716C',marginTop:2}}>{form.rfrBought?'Level 20 was purchased / boosted':'Reached level 20 through normal gameplay'}</div>
                  </div>
                </div>
              : <div style={{display:'flex',gap:10}}>
                  {[{val:false,icon:'🎮',label:'Made It Myself',sub:'Natural gameplay',col:'#16a34a',bg:'rgba(22,163,74,0.08)',border:'rgba(22,163,74,0.3)'},{val:true,icon:'💰',label:'RFR Bought',sub:'Purchased/boosted',col:'#92400e',bg:'rgba(217,119,6,0.08)',border:'rgba(217,119,6,0.3)'}].map(opt=>{
                    const sel=form.rfrBought===opt.val;
                    return <button key={String(opt.val)} type="button" onClick={()=>setForm(f=>({...f,rfrBought:opt.val}))} style={{flex:1,padding:'12px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${sel?opt.border:'rgba(0,0,0,0.08)'}`,background:sel?opt.bg:'#FAFAF9',cursor:'pointer',transition:'all 0.18s'}}>
                      <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                      <div style={{fontSize:12.5,fontWeight:600,color:sel?opt.col:'#A8A29E'}}>{opt.label}</div>
                      <div style={{fontSize:11,color:'#A8A29E',marginTop:2}}>{opt.sub}</div>
                    </button>;
                  })}
                </div>
            }
          </div>

          <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:12}}>
            <div>
              <label style={lbl}>Price (Rs)</label>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',color:'#d97706',fontWeight:700}}>{form.price>0?'Rs '+Number(form.price).toLocaleString('en-PK'):'—'}</div>
                :<input type="number" min={0} step={1} value={form.price} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} placeholder="0" style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
            <div>
              <label style={lbl}>Notes</label>
              {isView?<div style={inpRO}>{form.notes||'—'}</div>
                :<input value={form.notes} onChange={set('notes')} placeholder="Optional notes…" style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
          </div>

          <div style={{borderTop:'1px solid rgba(0,0,0,0.07)',paddingTop:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{width:3,height:14,background:'#ea580c',borderRadius:2}}/>
              <span style={{...lbl,marginBottom:0}}>Apex Sync</span>
              <span style={{fontSize:11.5,color:'#A8A29E',fontWeight:400,textTransform:'none',letterSpacing:0}}>Used for auto level & rank updates</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 90px',gap:12}}>
              <div>
                <label style={lbl}>Apex Username</label>
                {isView
                  ? <div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
                      {form.apexUsername?<><span style={{color:'#ea580c'}}>{form.apexUsername}</span>{account?.lastSynced&&<span style={{fontSize:10,color:'#A8A29E',marginLeft:'auto'}}>Synced {new Date(account.lastSynced).toLocaleString('en-PK',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>}</>:<span style={{color:'#A8A29E'}}>Not set</span>}
                    </div>
                  : <input value={form.apexUsername} onChange={set('apexUsername')} placeholder="e.g. tashbottle7001" style={inp} onFocus={fi} onBlur={fo}/>
                }
                {isView&&account?.syncError&&<div style={{marginTop:6,fontSize:11.5,color:'#e11d48',background:'rgba(225,29,72,0.08)',padding:'6px 10px',borderRadius:6,border:'1px solid rgba(225,29,72,0.2)'}}>⚠ {account.syncError}</div>}
              </div>
              <div>
                <label style={lbl}>Platform</label>
                {isView?<div style={{...inpRO,fontFamily:'var(--font-display)',textAlign:'center',fontWeight:600,color:'#ea580c'}}>{form.apexPlatform||'PC'}</div>
                  :<select value={form.apexPlatform} onChange={set('apexPlatform')} style={{...inp,cursor:'pointer'}} onFocus={fi} onBlur={fo}><option>PC</option><option>PS4</option><option value="X1">Xbox</option></select>}
              </div>
            </div>
          </div>

          {isView&&account?.createdAt&&<div style={{padding:'8px 12px',background:'#F5F0EB',borderRadius:7,fontSize:12,color:'#78716C',border:'1px solid rgba(0,0,0,0.07)'}}>Added {new Date(account.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>}

          {isView&&<motion.button type="button" onClick={onClose} whileHover={{ y:-1, boxShadow:'0 6px 20px rgba(234,88,12,0.35)' }} whileTap={{ scale:0.97 }}
            style={{width:'100%',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,background:'linear-gradient(135deg,#ea580c,#f97316)',border:'none',color:'white',cursor:'pointer',boxShadow:'0 2px 10px rgba(234,88,12,0.3)',transition:'all 0.18s',position:'relative',overflow:'hidden'}}>Close</motion.button>}

          {!isView&&<div style={{display:'flex',gap:10,paddingTop:4}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,background:'#F5F0EB',border:'1px solid rgba(0,0,0,0.1)',color:'#78716C',cursor:'pointer',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(234,88,12,0.3)';e.currentTarget.style.color='#ea580c';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,0,0,0.1)';e.currentTarget.style.color='#78716C';}}>Cancel</button>
            <motion.button type="button" onClick={handleSave} disabled={saving}
              whileHover={!saving?{y:-1,boxShadow:`0 6px 20px ${isEdit?'rgba(2,132,199,0.4)':'rgba(234,88,12,0.4)'}`}:{}}
              whileTap={!saving?{scale:0.97}:{}}
              style={{flex:2,padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,background:saving?'#E5E7EB':isEdit?'#0284c7':'linear-gradient(135deg,#ea580c,#f97316)',border:'none',color:'white',cursor:saving?'not-allowed':'pointer',boxShadow:saving?'none':isEdit?'0 2px 8px rgba(2,132,199,0.3)':'0 2px 8px rgba(234,88,12,0.3)',transition:'all 0.18s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {saving?<><svg style={{animation:'spin 0.8s linear infinite'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving…</>:isEdit?'✓ Save Changes':'+ Add Account'}
            </motion.button>
          </div>}
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
