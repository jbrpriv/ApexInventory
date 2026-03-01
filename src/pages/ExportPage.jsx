import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ExportPage() {
  const { token } = useAuth();
  const base = process.env.REACT_APP_API_URL || '';

  const download = (path) => {
    const a = document.createElement('a');
    a.href = base + path;
    // Attach token via localStorage workaround — server route reads query param
    a.href = base + path + '?token=' + token;
    a.click();
  };

  const cardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column', gap: 12,
  };

  const btnStyle = (color) => ({
    padding: '11px 20px', borderRadius: 8,
    background: 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)',
    border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 4px 12px ' + color + '33',
    letterSpacing: 0.3, fontFamily: 'inherit',
  });

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary-light)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Data</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Export Accounts</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>Download all account data in your preferred format.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 32 }}>📄</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>CSV Export</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            Download all accounts as a CSV file. Compatible with Excel, Google Sheets, and most spreadsheet applications.
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Columns: Email, Password, Recovery, Level, Status, Sales, Created</div>
          <button onClick={() => download('/api/export/csv')} style={btnStyle('var(--green)')}>
            ↓ Download CSV
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 32 }}>{ }{}</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>JSON Export</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            Download all accounts as a JSON file. Ideal for developers, backups, or importing into other systems.
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Full document with all fields and timestamps</div>
          <button onClick={() => download('/api/export/json')} style={btnStyle('var(--cyan)')}>
            ↓ Download JSON
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 24, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 10, padding: '14px 18px', fontSize: 13, color: 'var(--yellow)',
      }}>
        ⚠ Note: Exported files contain sensitive credentials. Store them securely and do not share.
      </div>
    </div>
  );
}
