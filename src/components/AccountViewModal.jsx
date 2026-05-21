import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BanStatusBadge, SalesBadge } from './StatusBadge';
import RankBadge from './RankBadge';

export default function AccountViewModal({ account, onClose }) {
  const [activeImage, setActiveImage] = useState('lobby');
  const [hoverImage, setHoverImage] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (url, type) => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${account.apexUsername || 'account'}-${type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };


  if (!account) return null;

  if (!account) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          overflowY: 'auto'
        }}>
        
        <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}}
          style={{
            position: 'relative',
            width: '100%', maxWidth: 900,
            background: 'var(--view-modal-bg)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            border: '1px solid var(--border-hi)',
            margin: 'auto'
          }}>
          


          {/* Close Button */}
          <button type="button" onClick={onClose}
            style={{
              position: 'absolute', top: 20, right: 20, zIndex: 10,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          >
            ✕
          </button>

          {/* Content Layout - Auto wraps on mobile */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', minHeight: 500 }}>
            
            {/* LEFT SIDE: Image Showcase */}
            <div style={{ flex: '1.4 1 450px', padding: 30, display: 'flex', flexDirection: 'column', gap: 20, borderRight: '1px solid var(--border-sm)' }}>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setActiveImage('lobby')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, background: activeImage === 'lobby' ? 'var(--primary-glow)' : 'var(--surface2)', border: `1px solid ${activeImage === 'lobby' ? 'var(--primary)' : 'var(--border)'}`, color: activeImage === 'lobby' ? 'var(--primary)' : 'var(--text4)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Lobby
                </button>
                <button type="button" onClick={() => setActiveImage('stats')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, background: activeImage === 'stats' ? 'var(--primary-glow)' : 'var(--surface2)', border: `1px solid ${activeImage === 'stats' ? 'var(--primary)' : 'var(--border)'}`, color: activeImage === 'stats' ? 'var(--primary)' : 'var(--text4)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Stats
                </button>
              </div>
              
              <div 
                style={{ flex: 1, borderRadius: 16, background: 'var(--surface2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-sm)', minHeight: 250, position: 'relative', cursor: (activeImage === 'lobby' && account.lobbyImage) || (activeImage === 'stats' && account.statsImage) ? (downloading ? 'wait' : 'pointer') : 'default' }}
                onMouseEnter={() => setHoverImage(true)}
                onMouseLeave={() => setHoverImage(false)}
                onClick={() => {
                  const currentImage = activeImage === 'lobby' ? account.lobbyImage : account.statsImage;
                  if (currentImage) handleDownload(currentImage, activeImage);
                }}
              >
                {activeImage === 'lobby' && account.lobbyImage ? (
                  <>
                    <img src={account.lobbyImage} alt="Lobby" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: hoverImage ? 'blur(6px) brightness(0.7)' : 'none', transition: 'all 0.25s' }} />
                    <AnimatePresence>
                      {hoverImage && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.6)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(4px)' }}>
                            {downloading ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                            <span style={{ fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>{downloading ? 'Downloading...' : 'Download Image'}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : activeImage === 'stats' && account.statsImage ? (
                  <>
                    <img src={account.statsImage} alt="Stats" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: hoverImage ? 'blur(6px) brightness(0.7)' : 'none', transition: 'all 0.25s' }} />
                    <AnimatePresence>
                      {hoverImage && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.6)', padding: '16px 24px', borderRadius: 16, backdropFilter: 'blur(4px)' }}>
                            {downloading ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                            <span style={{ fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>{downloading ? 'Downloading...' : 'Download Image'}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div style={{ color: 'var(--text4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>📷</div>
                    <p style={{ fontWeight: 600 }}>No Image Uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Account Data */}
            <div style={{ flex: '1 1 350px', padding: 40, display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ marginBottom: 25 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {account.apexUsername ? `@${account.apexUsername}` : 'No Apex ID'}
                </h2>
                <div style={{ color: 'var(--text3)', fontSize: 14, fontFamily: 'var(--font-mono)', marginTop: 8, display: 'inline-block', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-sm)' }}>
                  {account.accountEmail}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
                <BanStatusBadge status={account.accountStatus} />
                <SalesBadge status={account.salesStatus} />
                <RankBadge rank={account.rank} />
                <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontWeight: 700, fontSize: 13 }}>
                  Lv. {account.accountLevel}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 25 }}>
                <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 14, border: '1px solid var(--border-sm)', boxShadow: 'var(--sh-sm)' }}>
                  <div style={{ color: 'var(--text4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Price</div>
                  <div style={{ color: '#ea580c', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {account.price > 0 ? `Rs ${Number(account.price).toLocaleString('en-PK')}` : '—'}
                  </div>
                </div>
                
                <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 14, border: '1px solid var(--border-sm)', boxShadow: 'var(--sh-sm)' }}>
                  <div style={{ color: 'var(--text4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Sync Status</div>
                  <div style={{ color: account.syncError ? '#ef4444' : '#10b981', fontSize: 14, fontWeight: 700 }}>
                    {account.syncError ? 'Failed' : account.lastSynced ? 'Synced' : 'Pending'}
                  </div>
                  <div style={{ color: 'var(--text4)', fontSize: 11, marginTop: 4 }}>
                    {account.lastSynced ? new Date(account.lastSynced).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface)', padding: 20, borderRadius: 14, border: '1px solid var(--border-sm)', flex: 1, boxShadow: 'var(--sh-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>Password</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 13, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{account.accountPassword}</span>
                </div>
                {account.additionalAccountPassword && account.additionalAccountPassword !== '-' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>Add. Password</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 13, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{account.additionalAccountPassword}</span>
                  </div>
                )}
                {account.accountRecovery && account.accountRecovery !== '-' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>Recovery Code</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 13, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{account.accountRecovery}</span>
                  </div>
                )}
                {account.notes && (
                  <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-sm)' }}>
                    <div style={{ color: 'var(--text4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                    <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>{account.notes}</div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
