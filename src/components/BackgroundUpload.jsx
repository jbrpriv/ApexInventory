import React, { useState, useRef } from 'react';
import { uploadBackground, resetBackground } from '../api';
import toast from 'react-hot-toast';

export default function BackgroundUpload({ currentUrl, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type))
      return toast.error('Only JPG, PNG or WEBP allowed');
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await uploadBackground(fd);
      toast.success('Background updated!');
      onUpdate(res.data.url); setOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleReset = async () => {
    try { await resetBackground(); onUpdate(null); setOpen(false); toast.success('Background reset'); }
    catch { toast.error('Reset failed'); }
  };

  return (
    <>
      {/* Trigger button — full styled */}
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 10,
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,0.35)',
        color: 'white', fontSize: 13.5, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.18s',
        boxShadow: '0 2px 12px var(--border-md)',
        letterSpacing: 0.2,
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.26)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = ''; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Change Background
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} className="scale-in" style={{
            background: 'white', borderRadius: 20, width: '100%', maxWidth: 400,
            overflow: 'hidden', boxShadow: 'var(--sh-xl)',
          }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 17 }}>Background Image</div>
                <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 1 }}>Upload a custom hero background</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ width:32,height:32,borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text3)',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentUrl && (
                <div style={{ borderRadius: 10, overflow: 'hidden', height: 110, position: 'relative' }}>
                  <img src={currentUrl} alt="Current" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                  <div style={{ position:'absolute',bottom:6,left:8,background:'rgba(0,0,0,0.5)',color:'white',fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:500 }}>Current</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: 'none' }}/>
              <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:14, display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                {uploading ? 'Uploading...' : 'Upload New Image'}
              </button>
              {currentUrl && (
                <button onClick={handleReset} className="btn-danger" style={{ width:'100%',padding:'12px',fontSize:14 }}>🗑 Reset to Default</button>
              )}
              <p style={{ fontSize: 11.5, color:'var(--text4)', textAlign:'center' }}>JPG, PNG, WEBP · Max 10MB · Stored on Cloudinary</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
