import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getBotFeed, clearBotLogs, getBotScreen, sendBotCommand } from '../api';

const POLL_MS = 2000;
const MAX_LOGS = 500;
const SCREEN_POLL_MS = 3000;

const LEVEL_COLORS = {
  info:    'var(--text2)',
  success: '#16a34a',
  warn:    '#d97706',
  error:   '#e11d48',
};

const fmtTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString([], { hour12: false }); }
  catch { return ''; }
};

const timeAgo = (ts) => {
  if (!ts) return 'never';
  const s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function BotLogsPage() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [, setTick] = useState(0);

  const [frame, setFrame] = useState(null);
  const [mouseText, setMouseText] = useState('');
  const [sending, setSending] = useState(false);

  const lastIdRef = useRef(null);
  const frameSinceRef = useRef(null);
  const boxRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const { data } = await getBotFeed(lastIdRef.current);
      setStatus(data.status);
      setError(false);
      if (data.logs.length) {
        lastIdRef.current = data.logs[data.logs.length - 1].id;
        setLogs(prev => [...prev, ...data.logs].slice(-MAX_LOGS));
      }
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  const pollScreen = useCallback(async () => {
    try {
      const { data } = await getBotScreen(frameSinceRef.current);
      if (data.unchanged || !data.image) return;
      frameSinceRef.current = data.updatedAt;
      setFrame({ src: data.image, at: data.updatedAt });
    } catch { /* ignore, next poll retries */ }
  }, []);

  useEffect(() => {
    pollScreen();
    const id = setInterval(pollScreen, SCREEN_POLL_MS);
    return () => clearInterval(id);
  }, [pollScreen]);

  // refresh "x s ago" labels
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (autoScroll && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  const handleClear = async () => {
    try {
      await clearBotLogs();
      setLogs([]);
      toast.success('Logs cleared');
    } catch {
      toast.error('Failed to clear logs');
    }
  };

  const runCommand = async (type, text) => {
    if (sending) return;
    setSending(true);
    try {
      await sendBotCommand(type, text);
      toast.success(type === 'mouse' ? `Mouse → "${text}" sent` : `${type.replace('Btn', '').toUpperCase()} sent`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send command');
    } finally {
      setSending(false);
    }
  };

  const handleMouse = (e) => {
    e.preventDefault();
    const t = mouseText.trim();
    if (!t) return toast.error('Type a keyword first');
    runCommand('mouse', t);
  };

  const active = !!status?.active;
  const frameLive = active && !!frame && Date.now() - new Date(frame.at).getTime() < 20000;
  const dot = active ? '#16a34a' : '#e11d48';

  return (
    <div className="fade-in" style={{ padding: '28px 20px', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <style>{`@keyframes botPulse{0%{box-shadow:0 0 0 0 rgba(22,163,74,.55)}70%{box-shadow:0 0 0 10px rgba(22,163,74,0)}100%{box-shadow:0 0 0 0 rgba(22,163,74,0)}}`}</style>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 3, height: 16, borderRadius: 99, background: '#ea580c', display: 'inline-block' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', letterSpacing: 2, textTransform: 'uppercase' }}>Bot Logs</p>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 20, letterSpacing: '-0.5px' }}>
          Live Bot Monitor
        </h1>
      </motion.div>

      {/* Status card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '18px 22px', marginBottom: 16, display: 'flex', alignItems: 'center',
        gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 14, height: 14, borderRadius: '50%', background: dot, display: 'inline-block',
            animation: active ? 'botPulse 1.6s infinite' : 'none',
          }} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Bot Status</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: dot, lineHeight: 1.2 }}>
              {status === null ? 'Checking…' : active ? 'Active' : 'Offline'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <Meta label="Last seen" value={timeAgo(status?.lastSeen)} />
          <Meta label="Cycle" value={status?.cycle ?? 0} />
          {status?.host ? <Meta label="Machine" value={status.host} /> : null}
        </div>
      </div>

      {/* Live Display */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Live Display
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: frameLive ? '#16a34a' : 'var(--text4)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: frameLive ? '#16a34a' : 'var(--text4)', display: 'inline-block' }} />
            {frameLive ? 'LIVE' : 'LAST FRAME'}{frame ? ` · ${timeAgo(frame.at)}` : ''}
          </span>
        </div>
        <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
          {frame ? (
            <img src={frame.src} alt="Bot screen" style={{ width: '100%', display: 'block', opacity: frameLive ? 1 : 0.45, transition: 'opacity .3s' }} />
          ) : (
            <span style={{ color: 'var(--text4)', fontSize: 13, padding: 40 }}>
              No screenshot yet. It appears here once the bot is running.
            </span>
          )}
        </div>
      </div>

      {/* Remote Control */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Remote Control
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <button disabled={!active || sending} onClick={() => runCommand('escBtn')} style={{ ...ctrlBtn, opacity: active ? 1 : 0.5 }}>ESC</button>
          <button disabled={!active || sending} onClick={() => runCommand('spaceBtn')} style={{ ...ctrlBtn, opacity: active ? 1 : 0.5 }}>SPACE</button>
          <button disabled={!active || sending} onClick={() => runCommand('enterBtn')} style={{ ...ctrlBtn, opacity: active ? 1 : 0.5 }}>ENTER</button>
        </div>
        <form onSubmit={handleMouse} style={{ display: 'flex', gap: 8 }}>
          <input
            value={mouseText}
            onChange={e => setMouseText(e.target.value)}
            placeholder='Move mouse to text on screen, e.g. Cancel'
            maxLength={60}
            style={{
              flex: 1, minWidth: 0, background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none',
            }}
          />
          <button type="submit" disabled={!active || sending} style={{ ...ctrlBtn, opacity: active ? 1 : 0.5 }}>Move mouse</button>
        </form>
        {!active && (
          <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 8 }}>Bot is offline. Controls are disabled.</div>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--rose-bg)', border: '1px solid var(--rose-b)', color: 'var(--rose)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
          Can't reach the server. Retrying…
        </div>
      )}

      {/* Terminal */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Realtime logs · {logs.length}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!autoScroll && (
              <button onClick={() => setAutoScroll(true)} style={btn}>↓ Jump to latest</button>
            )}
            <button onClick={handleClear} style={btn}>Clear</button>
          </div>
        </div>

        <div ref={boxRef} onScroll={onScroll} style={{
          height: '55vh', minHeight: 320, overflowY: 'auto', padding: '12px 16px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 12.5, lineHeight: 1.65, background: 'var(--bg)',
        }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text4)', textAlign: 'center', paddingTop: 80 }}>
              {active ? 'Waiting for logs…' : 'No logs yet. Start the Python bot to see activity here.'}
            </div>
          ) : logs.map(l => (
            <div key={l.id} style={{ display: 'flex', gap: 10, wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--text4)', flexShrink: 0 }}>{fmtTime(l.ts)}</span>
              <span style={{ color: LEVEL_COLORS[l.level] || 'var(--text2)' }}>{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

const ctrlBtn = {
  background: '#ea580c', border: 'none', color: '#fff',
  borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};

const btn = {
  background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text2)',
  borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};