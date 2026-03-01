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
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return toast.error('Only JPG, PNG, WEBP allowed');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadBackground(formData);
      toast.success('Background updated!');
      onUpdate(res.data.url);
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetBackground();
      toast.success('Background reset');
      onUpdate(null);
      setOpen(false);
    } catch { toast.error('Reset failed'); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} title="Change Background" style={{
        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
        fontSize: 12, fontWeight: 500, fontFamily: 'inherit', letterSpacing: 0.5,
        backdropFilter: 'blur(8px)',
      }}>
        🖼 Change BG
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} className="fade-in" style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 380, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)',
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Background Image</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentUrl && (
                <div style={{ borderRadius: 8, overflow: 'hidden', height: 100 }}>
                  <img src={currentUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{
                padding: '10px', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
              }}>
                {uploading ? '⏳ Uploading...' : '📤 Upload New Background'}
              </button>
              {currentUrl && (
                <button onClick={handleReset} style={{
                  padding: '9px', borderRadius: 8,
                  background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)',
                  color: 'var(--red)', fontSize: 14, fontWeight: 600,
                }}>🗑 Reset to Default</button>
              )}
              <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>JPG, PNG, WEBP · Max 10MB · Hosted on Cloudinary</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
