import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BanStatusBadge, SalesBadge } from './StatusBadge';
import RankBadge from './RankBadge';

export default function AccountViewModal({ account, onClose }) {
  const [activeImage, setActiveImage] = useState('lobby');

  if (!account) return null;

  // Hero background uses the lobby image if available, else stats image
  const heroImage = account.lobbyImage || account.statsImage || null;

  return (
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
            background: 'var(--surface)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            border: '1px solid var(--border-hi)',
            margin: 'auto'
          }}>
          
          {/* Hero Blurred Background */}
          {heroImage && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(45px) saturate(180%) brightness(0.6)',
              opacity: 0.5,
              zIndex: 0,
              pointerEvents: 'none'
            }} />
          )}

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
            <div style={{ flex: '1 1 350px', padding: 30, display: 'flex', flexDirection: 'column', gap: 20, borderRight: '1px solid var(--border-sm)' }}>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setActiveImage('lobby')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, background: activeImage === 'lobby' ? 'rgba(234,88,12,0.15)' : 'rgba(0,0,0,0.3)', border: `1px solid ${activeImage === 'lobby' ? '#ea580c' : 'rgba(255,255,255,0.05)'}`, color: activeImage === 'lobby' ? '#ea580c' : 'var(--text4)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
                  Lobby
                </button>
                <button type="button" onClick={() => setActiveImage('stats')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, background: activeImage === 'stats' ? 'rgba(234,88,12,0.15)' : 'rgba(0,0,0,0.3)', border: `1px solid ${activeImage === 'stats' ? '#ea580c' : 'rgba(255,255,255,0.05)'}`, color: activeImage === 'stats' ? '#ea580c' : 'var(--text4)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
                  Stats
                </button>
              </div>
              
              <div style={{ flex: 1, borderRadius: 16, background: 'rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)', minHeight: 250, backdropFilter: 'blur(10px)' }}>
                {activeImage === 'lobby' && account.lobbyImage ? (
                  <img src={account.lobbyImage} alt="Lobby" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : activeImage === 'stats' && account.statsImage ? (
                  <img src={account.statsImage} alt="Stats" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                <div style={{ color: 'var(--text3)', fontSize: 14, fontFamily: 'var(--font-mono)', marginTop: 8, display: 'inline-block', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 8, backdropFilter: 'blur(4px)' }}>
                  {account.accountEmail}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
                <BanStatusBadge status={account.accountStatus} />
                <SalesBadge status={account.salesStatus} />
                <RankBadge rank={account.rank} />
                <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontWeight: 700, fontSize: 13, backdropFilter: 'blur(4px)' }}>
                  Lv. {account.accountLevel}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 25 }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ color: 'var(--text4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Price</div>
                  <div style={{ color: '#fbbf24', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {account.price > 0 ? `Rs ${Number(account.price).toLocaleString('en-PK')}` : '—'}
                  </div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ color: 'var(--text4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Sync Status</div>
                  <div style={{ color: account.syncError ? '#ef4444' : '#10b981', fontSize: 14, fontWeight: 700 }}>
                    {account.syncError ? 'Failed' : account.lastSynced ? 'Synced' : 'Pending'}
                  </div>
                  <div style={{ color: 'var(--text4)', fontSize: 11, marginTop: 4 }}>
                    {account.lastSynced ? new Date(account.lastSynced).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.4)', padding: 20, borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', flex: 1, backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>Password</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{account.accountPassword}</span>
                </div>
                {account.accountRecovery && account.accountRecovery !== '-' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>Recovery Code</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{account.accountRecovery}</span>
                  </div>
                )}
                {account.notes && (
                  <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: 'var(--text4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                    <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>{account.notes}</div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
