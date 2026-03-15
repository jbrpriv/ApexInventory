import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createAccount, updateAccount } from '../api';
import RankBadge, { RANKS } from './RankBadge';
import toast from 'react-hot-toast';

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

  const inp = { display:'block', width:'100%', background:'#F9FAFB', border:'1.5px solid #E5E7EB', borderRadius:8, padding:'10px 13px', fontSize:14, color:'#111827', fontFamily:'var(--font-body)', outline:'none', transition:'all 0.18s', boxSizing:'border-box' };
  const inpRO = { ...inp, background:'#F3F4F6', color:'#6B7280', cursor:'default' };
  const lbl = { display:'block', fontSize:11, fontWeight:600, color:'#6B7280', letterSpacing:0.8, textTransform:'uppercase', marginBottom:6 };
  const fi = e => { e.target.style.borderColor='#4F46E5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; e.target.style.background='white'; };
  const fo = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none'; e.target.style.background='#F9FAFB'; };

  const isBanned = form.accountStatus==='Banned';

  const CopyBtn = ({text,id}) => (
    <button type="button" onClick={()=>copyField(text,id)} style={{ background:copied===id?'#ECFDF5':'#F3F4F6', border:`1px solid ${copied===id?'#6EE7B7':'#E5E7EB'}`, color:copied===id?'#059669':'#9CA3AF', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:4 }}>
      {copied===id?<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>:<><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );
  const EyeBtn = ({show,onToggle}) => (
    <button type="button" onClick={onToggle} style={{ background:'#F3F4F6', border:'1px solid #E5E7EB', color:'#9CA3AF', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3, transition:'all 0.15s' }}>
      {show?<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide</>:<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show</>}
    </button>
  );

  const TIER_BTN = {
    Unranked: { sel:'#6B7280', selBg:'#F3F4F6',  selBorder:'#D1D5DB' },
    Bronze:   { sel:'#92400E', selBg:'#FEF3C7',  selBorder:'#FCD34D' },
    Silver:   { sel:'#374151', selBg:'#F3F4F6',  selBorder:'#D1D5DB' },
    Gold:     { sel:'#92400E', selBg:'#FFFBEB',  selBorder:'#FCD34D' },
    Platinum: { sel:'#0E7490', selBg:'#ECFEFF',  selBorder:'#A5F3FC' },
    Diamond:  { sel:'#1D4ED8', selBg:'#EFF6FF',  selBorder:'#BFDBFE' },
    Master:   { sel:'#6D28D9', selBg:'#F5F3FF',  selBorder:'#DDD6FE' },
    Predator: { sel:'#B91C1C', selBg:'#FFF1F2',  selBorder:'#FECACA' },
  };

  const modal = (
    /*
      KEY CHANGE from original:
      - Outer div uses className="modal-overlay" — this lets mobile.css change
        align-items to flex-end (bottom sheet) on small screens.
        We removed alignItems from the inline style so the CSS class can control it.
      - Inner div uses className="modal-box" — mobile.css gives it
        border-radius: 24px 24px 0 0 and full width on mobile.
    */
    <div
      className="modal-overlay"
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.35)', backdropFilter:'blur(8px)',
        display:'flex',
        /* alignItems intentionally removed from inline style — mobile.css sets it */
        justifyContent:'center', padding:20,
      }}
    >
      <div
        className="modal-box"
        onClick={e=>e.stopPropagation()}
        style={{
          background:'white', borderRadius:20,
          width:'100%', maxWidth:580, maxHeight:'92vh',
          overflowY:'auto',
          boxShadow:'var(--sh-xl)',
          animation:'modalIn 0.25s cubic-bezier(.22,.68,0,1.2) both',
        }}
      >
        {/* Header */}
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid #F3F4F6', position:'sticky', top:0, background:'white', zIndex:1, borderRadius:'20px 20px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:19, color:'var(--text)' }}>
                {isView?'Account Details':isAdd?'Add New Account':'Edit Account'}
              </div>
              <div style={{ color:'var(--text3)', fontSize:13, marginTop:3 }}>
                {isView?'View credentials & info':isAdd?'Fill in account information':'Update account information'}
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ width:32, height:32, borderRadius:7, background:'#F3F4F6', border:'1px solid #E5E7EB', color:'#9CA3AF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', minHeight:'auto', minWidth:'auto' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#FFF1F2';e.currentTarget.style.color='#E11D48';e.currentTarget.style.borderColor='#FECACA';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#F3F4F6';e.currentTarget.style.color='#9CA3AF';e.currentTarget.style.borderColor='#E5E7EB';}}
            >✕</button>
          </div>

          {isView && (
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:isBanned?'#FFF1F2':'#ECFDF5', color:isBanned?'#E11D48':'#059669', border:`1px solid ${isBanned?'#FECACA':'#6EE7B7'}`, display:'inline-flex', alignItems:'center', gap:5 }}>
                {isBanned?<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {isBanned?'Banned':'Unbanned'}
              </span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:form.salesStatus==='Sold'?'#FFFBEB':'#F8FAFC', color:form.salesStatus==='Sold'?'#D97706':'#475569', border:`1px solid ${form.salesStatus==='Sold'?'#FCD34D':'#E2E8F0'}` }}>{form.salesStatus}</span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:'var(--primary-pale)', color:'var(--primary)', border:'1px solid #C7D2FE' }}>Level {form.accountLevel}</span>
              <span style={{ padding:'3px 11px', borderRadius:99, fontSize:12, fontWeight:600, background:form.rfrBought?'#FFFBEB':'#ECFDF5', color:form.rfrBought?'#92400E':'#065F46', border:`1px solid ${form.rfrBought?'#FCD34D':'#6EE7B7'}` }}>{form.rfrBought?'💰 RFR Bought':'🎮 Made It'}</span>
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
                {[{val:'Unbanned',icon:'✅',label:'Unbanned',col:'#059669',bg:'#ECFDF5',border:'#6EE7B7'},{val:'Banned',icon:'🚫',label:'Banned',col:'#E11D48',bg:'#FFF1F2',border:'#FECACA'}].map(opt=>{
                  const active=form.accountStatus===opt.val;
                  return <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,accountStatus:opt.val}))} style={{ flex:1,padding:'11px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${active?opt.border:'#E5E7EB'}`,background:active?opt.bg:'#FAFAFA',cursor:'pointer',transition:'all 0.18s',boxShadow:active?'var(--sh-sm)':'none' }}>
                    <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:600,color:active?opt.col:'#9CA3AF'}}>{opt.label}</div>
                  </button>;
                })}
              </div>
            </div>
          )}

          {!isView && (
            <div>
              <label style={lbl}>Sales Status</label>
              <div style={{display:'flex',gap:10}}>
                {[{val:'Unsold',icon:'🏪',label:'Unsold',col:'#475569',bg:'#F8FAFC',border:'#CBD5E1'},{val:'Sold',icon:'💰',label:'Sold',col:'#D97706',bg:'#FFFBEB',border:'#FCD34D'}].map(opt=>{
                  const active=form.salesStatus===opt.val;
                  return <button key={opt.val} type="button" onClick={()=>setForm(f=>({...f,salesStatus:opt.val}))} style={{flex:1,padding:'11px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${active?opt.border:'#E5E7EB'}`,background:active?opt.bg:'#FAFAFA',cursor:'pointer',transition:'all 0.18s',boxShadow:active?'var(--sh-sm)':'none'}}>
                    <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:600,color:active?opt.col:'#9CA3AF'}}>{opt.label}</div>
                  </button>;
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Email {!isView&&<span style={{color:'#E11D48'}}>*</span>}</label>
              {isView&&<CopyBtn text={form.accountEmail} id="email"/>}
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13}}>{form.accountEmail||'—'}</div>
              :<input type="email" value={form.accountEmail} onChange={set('accountEmail')} placeholder="email@example.com" style={inp} onFocus={fi} onBlur={fo}/>}
          </div>

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Password {!isView&&<span style={{color:'#E11D48'}}>*</span>}</label>
              <div style={{display:'flex',gap:6}}><EyeBtn show={showPw} onToggle={()=>setShowPw(p=>!p)}/>{isView&&<CopyBtn text={form.accountPassword} id="pw"/>}</div>
            </div>
            {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13,letterSpacing:showPw?0.5:2}}>{showPw?form.accountPassword:'••••••••••••'}</div>
              :<input type={showPw?'text':'password'} value={form.accountPassword} onChange={set('accountPassword')} placeholder="Account password" style={inp} onFocus={fi} onBlur={fo}/>}
          </div>

          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>Additional Password <span style={{fontSize:10,color:'#9CA3AF',fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span></label>
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
              {isView?<div style={{...inpRO,fontFamily:'var(--font-display)',fontWeight:700,color:'var(--primary)',textAlign:'center',fontSize:22}}>{form.accountLevel}</div>
                :<input type="number" min={1} max={9999} value={form.accountLevel} onChange={e=>setForm(f=>({...f,accountLevel:parseInt(e.target.value)||1}))} style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
          </div>

          <div>
            <label style={lbl}>Rank</label>
            {isView
              ? <div style={{padding:'10px 14px',background:'#F9FAFB',borderRadius:8,border:'1px solid #E5E7EB',display:'flex',alignItems:'center',gap:10}}><RankBadge rank={form.rank}/></div>
              : <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                  {RANKS.map(r=>{
                    const tier=(r==='Unranked'||r==='Master'||r==='Predator')?r:r.split(' ')[0];
                    const tc=TIER_BTN[tier]||TIER_BTN.Unranked;
                    const sel=form.rank===r;
                    return <button key={r} type="button" onClick={()=>setForm(f=>({...f,rank:r}))} style={{ padding:'7px 4px',borderRadius:7,fontSize:10.5,fontWeight:sel?700:500,border:`1px solid ${sel?tc.selBorder:'#E5E7EB'}`,background:sel?tc.selBg:'#FAFAFA',color:sel?tc.sel:'#9CA3AF',cursor:'pointer',transition:'all 0.15s',textAlign:'center',boxShadow:sel?'var(--sh-xs)':'none' }}>{r}</button>;
                  })}
                </div>
            }
          </div>

          <div>
            <label style={lbl}>Level 20 Origin</label>
            {isView
              ? <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:form.rfrBought?'#FFFBEB':'#F0FDF4',border:`1px solid ${form.rfrBought?'#FCD34D':'#BBF7D0'}`}}>
                  <span style={{fontSize:20}}>{form.rfrBought?'💰':'🎮'}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:form.rfrBought?'#92400E':'#065F46'}}>{form.rfrBought?'RFR Bought':'Made It Myself'}</div>
                    <div style={{fontSize:12.5,color:'#6B7280',marginTop:2}}>{form.rfrBought?'Level 20 was purchased / boosted':'Reached level 20 through normal gameplay'}</div>
                  </div>
                </div>
              : <div style={{display:'flex',gap:10}}>
                  {[{val:false,icon:'🎮',label:'Made It Myself',sub:'Natural gameplay',col:'#065F46',bg:'#F0FDF4',border:'#86EFAC'},{val:true,icon:'💰',label:'RFR Bought',sub:'Purchased/boosted',col:'#92400E',bg:'#FFFBEB',border:'#FCD34D'}].map(opt=>{
                    const sel=form.rfrBought===opt.val;
                    return <button key={String(opt.val)} type="button" onClick={()=>setForm(f=>({...f,rfrBought:opt.val}))} style={{flex:1,padding:'12px 10px',borderRadius:10,textAlign:'center',border:`1.5px solid ${sel?opt.border:'#E5E7EB'}`,background:sel?opt.bg:'#FAFAFA',cursor:'pointer',transition:'all 0.18s',boxShadow:sel?'var(--sh-sm)':'none'}}>
                      <div style={{fontSize:18,marginBottom:4}}>{opt.icon}</div>
                      <div style={{fontSize:12.5,fontWeight:600,color:sel?opt.col:'#9CA3AF'}}>{opt.label}</div>
                      <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>{opt.sub}</div>
                    </button>;
                  })}
                </div>
            }
          </div>

          <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:12}}>
            <div>
              <label style={lbl}>Price (Rs)</label>
              {isView?<div style={{...inpRO,fontFamily:'var(--font-mono)',color:'#D97706',fontWeight:700}}>{form.price>0?'Rs '+Number(form.price).toLocaleString('en-PK'):'—'}</div>
                :<input type="number" min={0} step={1} value={form.price} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} placeholder="0" style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
            <div>
              <label style={lbl}>Notes</label>
              {isView?<div style={inpRO}>{form.notes||'—'}</div>
                :<input value={form.notes} onChange={set('notes')} placeholder="Optional notes…" style={inp} onFocus={fi} onBlur={fo}/>}
            </div>
          </div>

          <div style={{borderTop:'1px solid #F3F4F6',paddingTop:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{width:3,height:14,background:'var(--primary)',borderRadius:2}}/>
              <span style={lbl}>Apex Sync</span>
              <span style={{fontSize:11.5,color:'var(--text3)',fontWeight:400,textTransform:'none',letterSpacing:0}}>Used for auto level & rank updates</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 90px',gap:12}}>
              <div>
                <label style={lbl}>Apex Username</label>
                {isView
                  ? <div style={{...inpRO,fontFamily:'var(--font-mono)',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
                      {form.apexUsername?<><span style={{color:'var(--primary)'}}>{form.apexUsername}</span>{account?.lastSynced&&<span style={{fontSize:10,color:'var(--text4)',marginLeft:'auto'}}>Synced {new Date(account.lastSynced).toLocaleString('en-PK',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>}</>:<span style={{color:'var(--text4)'}}>Not set</span>}
                    </div>
                  : <input value={form.apexUsername} onChange={set('apexUsername')} placeholder="e.g. tashbottle7001" style={inp} onFocus={fi} onBlur={fo}/>
                }
                {isView&&account?.syncError&&<div style={{marginTop:6,fontSize:11.5,color:'#E11D48',background:'#FFF1F2',padding:'6px 10px',borderRadius:6,border:'1px solid #FECACA'}}>⚠ {account.syncError}</div>}
              </div>
              <div>
                <label style={lbl}>Platform</label>
                {isView?<div style={{...inpRO,fontFamily:'var(--font-display)',textAlign:'center',fontWeight:600,color:'var(--primary)'}}>{form.apexPlatform||'PC'}</div>
                  :<select value={form.apexPlatform} onChange={set('apexPlatform')} style={{...inp,cursor:'pointer'}} onFocus={fi} onBlur={fo}><option value="PC">PC</option><option value="PS4">PS4</option><option value="X1">Xbox</option></select>}
              </div>
            </div>
          </div>

          {isView&&account?.createdAt&&<div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:7,fontSize:12,color:'var(--text3)',border:'1px solid #F3F4F6'}}>Added {new Date(account.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>}

          {isView&&<button type="button" onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:9,fontSize:14,fontWeight:600,background:'var(--primary)',border:'none',color:'white',cursor:'pointer',boxShadow:'0 2px 8px rgba(79,70,229,0.3)',transition:'all 0.18s'}} onMouseEnter={e=>{e.currentTarget.style.background='var(--primary-h)';e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.background='var(--primary)';e.currentTarget.style.transform='';}}>Close</button>}

          {!isView&&<div style={{display:'flex',gap:10,paddingTop:4}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:'12px',borderRadius:9,fontSize:14,fontWeight:600,background:'#F9FAFB',border:'1px solid #E5E7EB',color:'var(--text3)',cursor:'pointer',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#C7D2FE';e.currentTarget.style.color='var(--primary)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='var(--text3)';}}>Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} style={{flex:2,padding:'12px',borderRadius:9,fontSize:14,fontWeight:600,background:saving?'#C7D2FE':isEdit?'#0284C7':'var(--primary)',border:'none',color:'white',cursor:saving?'not-allowed':'pointer',boxShadow:saving?'none':isEdit?'0 2px 8px rgba(2,132,199,0.3)':'0 2px 8px rgba(79,70,229,0.3)',transition:'all 0.18s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {saving?<><svg style={{animation:'spin 0.8s linear infinite'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving…</>:isEdit?'✓ Save Changes':'+ Add Account'}
            </button>
          </div>}
        </div>
      </div>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        /* Mobile: overlay becomes a bottom-sheet container */
        @media (max-width: 767px) {
          .modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .modal-box {
            border-radius: 24px 24px 0 0 !important;
            max-height: 92vh !important;
            max-width: 100% !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px) !important;
          }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}