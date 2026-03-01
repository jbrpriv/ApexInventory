import React from 'react';

const FEATURES = [
  { icon: '🔐', title: 'Secure Auth',        desc: 'JWT-based authentication with bcrypt password hashing.' },
  { icon: '◈',  title: 'Account Manager',    desc: 'Add, edit, delete and view all Apex Legends accounts with full CRUD.' },
  { icon: '◎',  title: 'Live Stats',         desc: 'Real-time charts — status, sales, level distribution, daily activity.' },
  { icon: '🖼',  title: 'Custom Background', desc: 'Upload a custom background image hosted on Cloudinary.' },
  { icon: '🔍', title: 'Search & Filter',    desc: 'Filter by status, sales status, and search by email.' },
  { icon: '📤', title: 'Export',             desc: 'Export all accounts to CSV or JSON with a single click.' },
  { icon: '📱', title: 'Mobile-First',       desc: 'Fully responsive UI that works beautifully on any screen size.' },
  { icon: '⚡', title: 'Bulk Actions',       desc: 'Select multiple accounts to bulk update or delete them.' },
];

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--primary-light)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>About</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Apex Manager</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginTop: 10, lineHeight: 1.7 }}>
          A private account management system for Apex Legends accounts. Track account status, manage credentials,
          and monitor sales — all in one secure, fast, and beautiful dashboard.
        </p>
      </div>

      {/* Features grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Tech Stack</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['React', 'React Router', 'Axios', 'Express.js', 'MongoDB', 'Mongoose', 'JWT', 'bcryptjs', 'Cloudinary', 'Multer'].map(t => (
            <span key={t} style={{
              background: 'var(--primary-dim)', border: '1px solid var(--border-accent)',
              color: 'var(--primary-light)', padding: '4px 12px', borderRadius: 99,
              fontSize: 12, fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
