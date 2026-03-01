import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ExportPage() {
  const { token } = useAuth();
  const base = process.env.REACT_APP_API_URL || '';

  const download = (path) => {
    const a = document.createElement('a');
    a.href = base + path + '?token=' + token;
    a.click();
  };

  const exports = [
    {
      id: 'csv',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      title: 'CSV Export',
      desc: 'Download all accounts as a CSV file. Compatible with Excel, Google Sheets, and most spreadsheet applications.',
      meta: 'Columns: Email, Password, Recovery, Level, Status, Sales, Created',
      btnLabel: 'Download CSV',
      btnBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      btnShadow: 'rgba(5,150,105,0.4)',
      tagBg: '#ecfdf5',
      tagColor: '#059669',
      tagBorder: '#6ee7b7',
      tagLabel: 'CSV',
      borderTop: '#059669',
      path: '/api/export/csv',
    },
    {
      id: 'json',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
          <line x1="8" y1="9" x2="10" y2="9"/>
        </svg>
      ),
      title: 'JSON Export',
      desc: 'Download all accounts as a JSON file. Ideal for developers, backups, or importing into other systems.',
      meta: 'Full document with all fields and timestamps',
      btnLabel: 'Download JSON',
      btnBg: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      btnShadow: 'rgba(37,99,235,0.4)',
      tagBg: '#eff6ff',
      tagColor: '#2563eb',
      tagBorder: '#93c5fd',
      tagLabel: 'JSON',
      borderTop: '#2563eb',
      path: '/api/export/json',
    },
  ];

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Data</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Export Accounts</h1>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>Download all account data in your preferred format.</p>
      </div>

      {/* Export cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 24 }}>
        {exports.map(ex => (
          <div key={ex.id} style={{
            background: 'white', border: '1px solid var(--border)',
            borderTop: `3px solid ${ex.borderTop}`,
            borderRadius: 14, padding: '26px 24px',
            boxShadow: 'var(--sh-sm)',
            display: 'flex', flexDirection: 'column', gap: 14,
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = ''; }}
          >
            {/* Icon + tag row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: ex.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${ex.tagBorder}` }}>
                {ex.icon}
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: ex.tagBg, color: ex.tagColor, border: `1px solid ${ex.tagBorder}`, letterSpacing: 0.5 }}>
                .{ex.tagLabel}
              </span>
            </div>

            {/* Title & desc */}
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 19, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{ex.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text3)', lineHeight: 1.65 }}>{ex.desc}</div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: 11.5, color: 'var(--text4)', background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8, fontFamily: "'JetBrains Mono',monospace" }}>
              {ex.meta}
            </div>

            {/* Download button — clearly visible */}
            <button
              onClick={() => download(ex.path)}
              style={{
                padding: '13px 20px',
                borderRadius: 10,
                background: ex.btnBg,
                border: 'none',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${ex.btnShadow}`,
                letterSpacing: 0.3,
                fontFamily: 'inherit',
                transition: 'all 0.18s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${ex.btnShadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 16px ${ex.btnShadow}`; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {ex.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Warning notice */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fcd34d',
        borderRadius: 10, padding: '14px 18px',
        fontSize: 13.5, color: '#92400e',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span><strong>Note:</strong> Exported files contain sensitive credentials including passwords. Store them securely and do not share with others.</span>
      </div>
    </div>
  );
}
