import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import RankBadge, { RANKS } from './RankBadge';
import toast from 'react-hot-toast';

const EMPTY = { accountStatus:'Unbanned', accountEmail:'', accountPassword:'', additionalAccountPassword:'', accountRecovery:'', accountLevel:1, salesStatus:'Unsold', notes:'', price:0, rfrBought:false, rank:'Unranked' };

export default function AccountModal({ account, mode, onClose, onSaved }) {
  const isView=mode==='view', isAdd=mode==='add', isEdit=mode==='edit';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isAdd) { setForm(EMPTY); setShowPw(false); }
    else if (account&&(isView||isEdit)) {
      setForm({ accountStatus:account.accountStatus||'Unbanned', accountEmail:account.accountEmail||'', accountPassword:account.accountPassword||'', additionalAccountPassword:account.additionalAccountPassword||'', accountRecovery:account.accountRecovery||'', accountLevel:account.accountLevel||1, salesStatus:account.salesStatus||'Unsold', notes:account.notes||'', price:account.price||0, rfrBought:account.rfrBought||false, rank:account.rank||'Unranked' });
      setShowPw(isView); setShowAddPw(false);
    }
    setSaving(false);
  }, [account, mode]);

  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);

  const set = (k) => (e) => setForm(f=>({...f,[k]:e.target.value}));
  const copyField = (text,key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(''),1500); toast.success('Copied!',{duration:900}); };

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

  const isBanned = form.accountStatus === 'Banned';

  // Shared input styles
  const inp = { display:'block', width:'100%', background:'var(--surface)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 13px', fontSize:13.5, color:'var(--text)', fontFamily:'var(--font-body)', outline:'none', transition:'all 0.2s', boxSizing:'border-box' };
  const inpRO = { ...inp, background:'rgba(255,255,255,0.02)', color:'var(--text2)', cursor:'default' };
  const lbl = { display:'block', fontSize:9, fontWeight:700, color:'var(--text3)', letterSpacing:2, textTransform:'uppercase', marginBottom:7, fontFamily:'var(--font-display)' };
  const fi = (e) => { e.target.style.borderColor='var(--neon)'; e.target.style.boxShadow='0 0 0 3px var(--neon-dim)'; e.target.style.background='rgba(0,217,255,0.03)'; };
  const fo = (e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; e.target.style.background='var(--surface)'; };

  const CopyBtn = ({text,id}) => (
    <button type="button" onClick={()=>copyField(text,id)} style={{ background:copied===id?'rgba(0,255,136,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${copied===id?'rgba(0,255,136,0.3)':'rgba(255,255,255,0.08)'}`, color:copied===id?'var(--safe)':'var(--text3)', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:4, fontFamily:'var(--font-display)', letterSpacing:0.5 }}>
      {copied===id?<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>OK</>:<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );
  const EyeBtn = ({show,onToggle}) => (
    <button type="button" onClick={onToggle} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text3)', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3, fontFamily:'var(--font-display)', letterSpacing:0.5 }}>
      {show?<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide</>:<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show</>}
    </button>
  );

  const TIER_COLORS = { Diamond:{color:'#a5c8ff',border:'rgba(79,140,255,0.4)',bg:'rgba(79,140,255,0.08)'}, Platinum:{color:'#67e8f9',border:'rgba(6,182,212,0.35)',bg:'rgba(6,182,212,0.06)'}, Gold:{color:'var(--gold)',border:'rgba(255,184,0,0.35)',bg:'var(--gold-dim)'}, Silver:{color:'#94a3b8',border:'rgba(148,163,184,0.3)',bg:'rgba(148,163,184,0.05)'}, Unranked:{color:'var(--text3)',border:'var(--border)',bg:'rgba(255,255,255,0.02)'} };

  const modal = (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(4,6,12,0.9)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', boxSizing:'border-box' }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:'relative', background:'var(--card)', border:'1px solid rgba(0,217,255,0.15)', borderRadius:18, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 30px 100px rgba(0,0,0,0.8), 0 0 60px rgba(0,217,255,0.08)', animation:'modalIn 0.3s cubic-bezier(0.22,0.68,0,1.2) both' }}>

        {/* Top accent */}
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,var(--neon),var(--violet),transparent)', borderRadius:'18px 18px 0 0' }} />

        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--card)', zIndex:1, borderRadius:'18px 18px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--text)', letterSpacing:1.5, textTransform:'uppercase' }}>
                {isView?'Account Details':isAdd?'Add Account':'Edit Account'}
              </div>
              <div style={{ color:'var(--text3)', fontSize:11.5, marginTop:3 }}>
                {isView?'View credentials & info':isAdd?'Fill in account information':'Update account information'}
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ width:32, height:32, borderRadius:7, background:'rgba(255,51,85,0.08)', border:'1px solid rgba(255,51,85,0.2)', color:'var(--danger)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--danger-dim)';e.currentTarget.style.boxShadow='0 0 12px rgba(255,51,85,0.2)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,51,85,0.08)';e.currentTarget.style.boxShadow='none';}}
            >✕</button>
          </div>

          {isView && (
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:11, fontWeight:700, background:isBanned?'var(--danger-dim)':'rgba(0,255,136,0.08)', color:isBanned?'var(--danger)':'var(--safe)', border:`1px solid ${isBanned?'rgba(255,51,85,0.3)':'rgba(0,255,136,0.25)'}`, display:'inline-flex', alignItems:'center', gap:5, fontFamily:'var(--font-display)', letterSpacing:0.8 }}>
                {isBanned?<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {isBanned?'Banned':'Unbanned'}
              </span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:11, fontWeight:700, background:form.salesStatus==='Sold'?'var(--gold-dim)':'rgba(255,255,255,0.04)', color:form.salesStatus==='Sold'?'var(--gold)':'var(--text3)', border:`1px solid ${form.salesStatus==='Sold'?'rgba(255,184,0,0.3)':'var(--border)'}`, fontFamily:'var(--font-display)', letterSpacing:0.8 }}>
                {form.salesStatus}
              </span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:11, fontWeight:700, background:'var(--neon-dim)', color:'var(--neon)', border:'1px solid rgba(0,217,255,0.25)', fontFamily:'var(--font-display)', letterSpacing:0.8 }}>LV {form.accountLevel}</span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:11, fontWeight:700, background:form.rfrBought?'var(--gold-dim)':'rgba(0,255,136,0.07)', color:form.rfrBought?'var(--gold)':'var(--safe)', border:`1px solid ${form.rfrBought?'rgba(255,184,0,0.25)':'rgba(0,255,136,0.2)'}`, fontFamily:'var(--font-display)', letterSpacing:0.8 }}>
                {form.rfrBought?'💰 RFR':'🎮 Made It'}
              </span>
              <RankBadge rank={form.rank} />
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* BAN STATUS — radio cards */}
          {!isView && (
            <div>
              <label style={lbl}>Ban Status</label>
              <div style={{ display:'flex', gap:10 }}>
                {[
                  {val:'Unbanned', icon:'✅', label:'Unbanned', color:'var(--safe)',   border:'rgba(0,255,136,0.35)',   bg:'rgba(0,255,136,0.07)'},
                  {val:'Banned',   icon:'🚫', label:'Banned',   color:'var(--danger)', border:'rgba(255,51,85,0.35)',   bg:'var(--danger-dim)'},
                ].map(opt=>{
                  const active = form.accountStatus===opt.val;
                  return (
                    <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,accountStatus:opt.val}))} style={{
                      flex:1, padding:'12px 10px', borderRadius:10, textAlign:'center',
                      border:`1.5px solid ${active?opt.border:'rgba(255,255,255,0.08)'}`,
                      background: active?opt.bg:'rgba(255,255,255,0.02)',
                      cursor:'pointer', transition:'all 0.2s',
                      boxShadow: active?`0 0 16px ${opt.bg}`:'none',
                    }}>
                      <div style={{ fontSize:18, marginBottom:4 }}>{opt.icon}</div>
                      <div style={{ fontSize:11.5, fontWeight:700, color:active?opt.color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase' }}>{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SALES STATUS */}
          {!isView && (
            <div>
              <label style={lbl}>Sales Status</label>
              <div style={{ display:'flex', gap:10 }}>
                {[
                  {val:'Unsold', icon:'🏪', label:'Unsold', color:'var(--silver)', border:'rgba(122,143,166,0.3)', bg:'rgba(122,143,166,0.05)'},
                  {val:'Sold',   icon:'💰', label:'Sold',   color:'var(--gold)',   border:'rgba(255,184,0,0.35)',  bg:'var(--gold-dim)'},
                ].map(opt=>{
                  const active = form.salesStatus===opt.val;
                  return (
                    <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,salesStatus:opt.val}))} style={{
                      flex:1, padding:'11px 10px', borderRadius:10, textAlign:'center',
                      border:`1.5px solid ${active?opt.border:'rgba(255,255,255,0.08)'}`,
                      background:active?opt.bg:'rgba(255,255,255,0.02)',
                      cursor:'pointer', transition:'all 0.2s',
                    }}>
                      <div style={{ fontSize:16, marginBottom:3 }}>{opt.icon}</div>
                      <div style={{ fontSize:11.5, fontWeight:700, color:active?opt.color:'var(--text3)', fontFamily:'var(--font-display)', letterSpacing:1, textTransform:'uppercase' }}>{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <label style={{...lbl,marginBottom:0}}>Email {!isView&&<span style={{color:'var(--danger)'}}>*</span>}</label>
              {isView&&<CopyBtn text={form.accountEmail} id="email" />}
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.accountEmail||'—'}</div>
              :<input type="email" value={form.accountEmail} onChange={set('accountEmail')} placeholder="email@example.com" style={inp} onFocus={fi} onBlur={fo} />}
          </div>

          {/* PASSWORD */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <label style={{...lbl,marginBottom:0}}>Password {!isView&&<span style={{color:'var(--danger)'}}>*</span>}</label>
              <div style={{ display:'flex', gap:6 }}>
                <EyeBtn show={showPw} onToggle={()=>setShowPw(p=>!p)} />
                {isView&&<CopyBtn text={form.accountPassword} id="pw" />}
              </div>
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13,letterSpacing:showPw?0.5:2}}>{showPw?form.accountPassword:'••••••••••••'}</div>
              :<input type={showPw?'text':'password'} value={form.accountPassword} onChange={set('accountPassword')} placeholder="Account password" style={inp} onFocus={fi} onBlur={fo} />}
          </div>

          {/* ADDITIONAL PASSWORD */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <label style={{...lbl,marginBottom:0}}>Additional Password <span style={{fontSize:9,color:'var(--text4)',fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span></label>
              <div style={{ display:'flex', gap:6 }}>
                {(form.additionalAccountPassword||!isView)&&<EyeBtn show={showAddPw} onToggle={()=>setShowAddPw(p=>!p)} />}
                {isView&&form.additionalAccountPassword&&<CopyBtn text={form.additionalAccountPassword} id="addpw" />}
              </div>
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.additionalAccountPassword?(showAddPw?form.additionalAccountPassword:'••••••••••••'):'—'}</div>
              :<input type={showAddPw?'text':'password'} value={form.additionalAccountPassword} onChange={set('additionalAccountPassword')} placeholder="Optional second password" style={inp} onFocus={fi} onBlur={fo} />}
          </div>

          {/* RECOVERY + LEVEL */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px', gap:12 }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                <label style={{...lbl,marginBottom:0}}>Recovery Email</label>
                {isView&&form.accountRecovery&&<CopyBtn text={form.accountRecovery} id="rec" />}
              </div>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.accountRecovery||'—'}</div>
                :<input value={form.accountRecovery} onChange={set('accountRecovery')} placeholder="recovery@example.com" style={inp} onFocus={fi} onBlur={fo} />}
            </div>
            <div>
              <label style={lbl}>Level</label>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-display)',fontWeight:700,color:'var(--neon)',textAlign:'center',fontSize:22,letterSpacing:1,textShadow:'0 0 12px rgba(0,217,255,0.5)'}}>{form.accountLevel}</div>
                :<input type="number" min={1} max={9999} value={form.accountLevel} onChange={e=>setForm(f=>({...f,accountLevel:parseInt(e.target.value)||1}))} style={inp} onFocus={fi} onBlur={fo} />}
            </div>
          </div>

          {/* RANK PICKER */}
          <div>
            <label style={lbl}>Rank</label>
            {isView
              ? <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:8, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}><RankBadge rank={form.rank} /></div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                  {RANKS.map(r=>{
                    const tier = r==='Unranked'?'Unranked':r.split(' ')[0];
                    const tc = TIER_COLORS[tier]||TIER_COLORS.Unranked;
                    const sel = form.rank===r;
                    return (
                      <button key={r} type="button" onClick={()=>setForm(f=>({...f,rank:r}))} style={{
                        padding:'7px 4px', borderRadius:7, fontSize:10, fontWeight:sel?700:500,
                        border:`1px solid ${sel?tc.border:'rgba(255,255,255,0.06)'}`,
                        background:sel?tc.bg:'rgba(255,255,255,0.02)',
                        color:sel?tc.color:'var(--text3)',
                        cursor:'pointer', transition:'all 0.15s', textAlign:'center',
                        fontFamily:'var(--font-display)', letterSpacing:0.5,
                        boxShadow:sel?`0 0 10px ${tc.bg}`:'none',
                      }}>{r}</button>
                    );
                  })}
                </div>
            }
          </div>

          {/* RFR / MADE IT */}
          <div>
            <label style={lbl}>Level 20 Origin</label>
            {isView
              ? <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, background:form.rfrBought?'var(--gold-dim)':'rgba(0,255,136,0.06)', border:`1.5px solid ${form.rfrBought?'rgba(255,184,0,0.25)':'rgba(0,255,136,0.2)'}` }}>
                  <span style={{fontSize:20}}>{form.rfrBought?'💰':'🎮'}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:form.rfrBought?'var(--gold)':'var(--safe)',fontFamily:'var(--font-display)',letterSpacing:1}}>{form.rfrBought?'RFR Bought':'Made It Myself'}</div>
                    <div style={{fontSize:11.5,color:'var(--text3)',marginTop:2}}>{form.rfrBought?'Level 20 was purchased / boosted':'Reached level 20 through normal gameplay'}</div>
                  </div>
                </div>
              : <div style={{ display:'flex', gap:10 }}>
                  {[
                    {val:false,icon:'🎮',label:'Made It',sub:'Natural gameplay',color:'var(--safe)',border:'rgba(0,255,136,0.3)',bg:'rgba(0,255,136,0.06)'},
                    {val:true, icon:'💰',label:'RFR Bought',sub:'Purchased / boosted',color:'var(--gold)',border:'rgba(255,184,0,0.3)',bg:'var(--gold-dim)'},
                  ].map(opt=>{
                    const sel=form.rfrBought===opt.val;
                    return (
                      <button key={String(opt.val)} type="button" onClick={()=>setForm(f=>({...f,rfrBought:opt.val}))} style={{ flex:1,padding:'12px 10px',borderRadius:10,textAlign:'center', border:`1.5px solid ${sel?opt.border:'rgba(255,255,255,0.08)'}`, background:sel?opt.bg:'rgba(255,255,255,0.02)', cursor:'pointer',transition:'all 0.2s', boxShadow:sel?`0 0 14px ${opt.bg}`:'none' }}>
                        <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                        <div style={{fontSize:11.5,fontWeight:700,color:sel?opt.color:'var(--text3)',fontFamily:'var(--font-display)',letterSpacing:1,textTransform:'uppercase'}}>{opt.label}</div>
                        <div style={{fontSize:10.5,color:'var(--text3)',marginTop:2}}>{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
            }
          </div>

          {/* PRICE + NOTES */}
          <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:12 }}>
            <div>
              <label style={lbl}>Price (Rs)</label>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',color:'var(--gold)',fontWeight:700}}>{form.price>0?'Rs '+Number(form.price).toLocaleString('en-PK'):'—'}</div>
                :<input type="number" min={0} step={1} value={form.price} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} placeholder="0" style={inp} onFocus={fi} onBlur={fo} />}
            </div>
            <div>
              <label style={lbl}>Notes</label>
              {isView?<div style={inpRO}>{form.notes||'—'}</div>
                :<input value={form.notes} onChange={set('notes')} placeholder="Optional notes…" style={inp} onFocus={fi} onBlur={fo} />}
            </div>
          </div>

          {isView&&account?.createdAt&&(
            <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.02)', borderRadius:7, fontSize:11.5, color:'var(--text3)', border:'1px solid var(--border)', fontFamily:'var(--font-mono)' }}>
              Created: {new Date(account.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
            </div>
          )}

          {/* FOOTER */}
          {isView&&(
            <button type="button" onClick={onClose} style={{ width:'100%',padding:'12px',borderRadius:9,fontSize:12,fontWeight:700,fontFamily:'var(--font-display)',letterSpacing:2,textTransform:'uppercase',background:'var(--neon-dim)',border:'1.5px solid rgba(0,217,255,0.3)',color:'var(--neon)',cursor:'pointer',boxShadow:'0 0 20px var(--neon-dim)',transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,217,255,0.15)';e.currentTarget.style.boxShadow='var(--sh-neon)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--neon-dim)';e.currentTarget.style.boxShadow='0 0 20px var(--neon-dim)';}}
            >Close</button>
          )}

          {!isView&&(
            <div style={{ display:'flex', gap:10, paddingTop:4 }}>
              <button type="button" onClick={onClose} style={{ flex:1,padding:'12px',borderRadius:9,fontSize:12,fontWeight:600,fontFamily:'var(--font-display)',letterSpacing:1.5,textTransform:'uppercase',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',color:'var(--text2)',cursor:'pointer',transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--silver)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}
              >Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} style={{ flex:2,padding:'12px',borderRadius:9,fontSize:12,fontWeight:700,fontFamily:'var(--font-display)',letterSpacing:1.5,textTransform:'uppercase', background:saving?'rgba(0,217,255,0.1)':isEdit?'rgba(77,159,255,0.1)':'var(--neon-dim)', border:`1.5px solid ${saving?'rgba(0,217,255,0.2)':isEdit?'rgba(77,159,255,0.4)':'rgba(0,217,255,0.4)'}`, color:saving?'rgba(0,217,255,0.5)':isEdit?'#4d9fff':'var(--neon)', cursor:saving?'not-allowed':'pointer', transition:'all 0.18s', display:'flex',alignItems:'center',justifyContent:'center',gap:8, boxShadow:saving?'none':isEdit?'0 0 16px rgba(77,159,255,0.2)':'0 0 16px var(--neon-dim)' }}>
                {saving?<><svg style={{animation:'spin 0.8s linear infinite'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving...</>:isEdit?'✓ Save Changes':'+ Add Account'}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
