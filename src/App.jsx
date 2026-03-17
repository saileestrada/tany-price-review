import { useState, useEffect, useCallback } from 'react';
import { ITEMS } from './data';
import './App.css';

function pct(val) { return (val * 100).toFixed(1) + '%'; }
function pctSigned(val) { return (val >= 0 ? '+' : '') + (val * 100).toFixed(1) + '%'; }
function dollars(val) { return '$' + Number(val).toFixed(2); }
function marginClass(val) {
  if (val >= 0.22) return 'badge green';
  if (val >= 0.18) return 'badge yellow';
  return 'badge red';
}
function marginIcon(val) {
  if (val >= 0.22) return '✓';
  if (val >= 0.18) return '▲';
  return '✕';
}
function incClass(val) {
  if (val <= 0.05) return 'badge green';
  if (val <= 0.12) return 'badge yellow';
  return 'badge red';
}
function incIcon(val) {
  if (val <= 0.05) return '✓';
  if (val <= 0.12) return '▲';
  return '✕';
}
function dropClass(val) {
  if (val >= -0.02) return 'drop-low';
  if (val >= -0.07) return 'drop-mid';
  return 'drop-high';
}
function encodeState(d) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(d)))); } catch { return ''; }
}
function decodeState(s) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return {}; }
}
function getStateFromUrl() {
  const p = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const s = p.get('s');
  return s ? decodeState(s) : {};
}
function setStateInUrl(d) {
  window.location.hash = 's=' + encodeState(d);
}

export default function App() {
  const [tab, setTab] = useState('pending');
  const [decisions, setDecisions] = useState(() => getStateFromUrl());
  const [copied, setCopied] = useState(false);

  useEffect(() => { setStateInUrl(decisions); }, [decisions]);

  const updateDecision = useCallback((id, field, value) => {
    setDecisions(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }, []);

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const pending = ITEMS.filter(r => decisions[r.id]?.decision !== 'no');
  const reviewed = ITEMS.filter(r => decisions[r.id]?.decision === 'no');
  const rows = tab === 'pending' ? pending : tab === 'reviewed' ? reviewed : ITEMS;

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Tany Foods — Price Review</h1>
          <p className="subtitle">Cost increase review · March 2026</p>
        </div>
        <button className={`btn-share${copied ? ' copied' : ''}`} onClick={shareLink}>
          {copied ? '✓ Copied!' : 'Share link'}
        </button>
      </div>

      <div className="legend">
        <span className="badge green">✓ above 22%</span>
        <span className="badge yellow">▲ 18–22%</span>
        <span className="badge red">✕ below 18%</span>
        <span className="legend-note">Applied to Inc %, Tany EA Margin, New Margin, SRP Margin</span>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>
          Pending review <span className="count">{pending.length}</span>
        </button>
        <button className={`tab${tab === 'reviewed' ? ' active' : ''}`} onClick={() => setTab('reviewed')}>
          No change — reviewed <span className="count gray">{reviewed.length}</span>
        </button>
        <button className={`tab${tab === 'reference' ? ' active' : ''}`} onClick={() => setTab('reference')}>
          Reference data <span className="count gray">{ITEMS.length}</span>
        </button>
      </div>

      {tab === 'reference' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-id">Item No.</th>
                <th className="col-name">Product</th>
                <th className="col-num">Prev Cost</th>
                <th className="col-num">New Cost</th>
                <th className="col-num">Diff</th>
                <th className="col-num">Inc %</th>
                <th className="col-num">Items/CS</th>
                <th className="col-num">CIF EA</th>
                <th className="col-num">Tany EA $</th>
                <th className="col-num">Prev Margin</th>
                <th className="col-num">Curr Margin</th>
                <th className="col-num">Margin Drop</th>
                <th className="col-num">SRP EA $</th>
                <th className="col-num">SRP Margin</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map(r => (
                <tr key={r.id}>
                  <td className="cell-id">{r.id}</td>
                  <td className="cell-name">{r.name}</td>
                  <td className="col-num">{dollars(r.prevCost)}</td>
                  <td className="col-num">{dollars(r.newCost)}</td>
                  <td className="col-num">{dollars(r.difference)}</td>
                  <td className="col-num"><span className={incClass(r.inc)}>{incIcon(r.inc)} {pct(r.inc)}</span></td>
                  <td className="col-num">{r.items}</td>
                  <td className="col-num">{dollars(r.cifEA)}</td>
                  <td className="col-num">{dollars(r.tanyEA)}</td>
                  <td className="col-num"><span className={marginClass(r.prevMargin)}>{marginIcon(r.prevMargin)} {pct(r.prevMargin)}</span></td>
                  <td className="col-num"><span className={marginClass(r.tanyMargin)}>{marginIcon(r.tanyMargin)} {pct(r.tanyMargin)}</span></td>
                  <td className="col-num"><span className={dropClass(r.marginDrop)}>{pctSigned(r.marginDrop)}</span></td>
                  <td className="col-num">{r.srp > 0 ? dollars(r.srp) : '—'}</td>
                  <td className="col-num">{r.srp > 0 ? <span className={marginClass(r.srpMargin)}>{marginIcon(r.srpMargin)} {pct(r.srpMargin)}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-id">Item No.</th>
                <th className="col-name">Product</th>
                <th className="col-num">Inc %</th>
                <th className="col-input">CIF EA</th>
                <th className="col-num">Tany EA $</th>
                <th className="col-num">Prev Margin</th>
                <th className="col-num">Tany EA Margin</th>
                <th className="col-num">Margin Drop</th>
                <th className="col-num">Current SRP</th>
                <th className="col-num">Current SRP Margin</th>
                <th className="col-action">Change price?</th>
                <th className="col-input">New Tany EA $</th>
                <th className="col-num">New Margin</th>
                <th className="col-input">Suggested SRP</th>
                <th className="col-num">New SRP Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={15} className="empty">
                  {tab === 'pending' ? 'All items reviewed.' : 'No items marked as no change yet.'}
                </td></tr>
              )}
              {rows.map(r => {
                const d = decisions[r.id] || {};
                const cifEA = d.cifEA !== undefined ? parseFloat(d.cifEA) : r.cifEA;
                const newPrice = parseFloat(d.newPrice) || 0;
                const sugSrp = parseFloat(d.sugSrp) || 0;
                const tanyMargin = cifEA > 0 && r.tanyEA > 0 ? 1 - (cifEA / r.tanyEA) : r.tanyMargin;
                const newMargin = newPrice > 0 && cifEA > 0 ? 1 - (cifEA / newPrice) : null;
                const srpMargin = sugSrp > 0 && newPrice > 0 ? 1 - (newPrice / sugSrp) : null;
                return (
                  <tr key={r.id}>
                    <td className="cell-id">{r.id}</td>
                    <td className="cell-name" title={r.id + ' — ' + r.name}>{r.name}</td>
                    <td className="col-num"><span className={incClass(r.inc)}>{incIcon(r.inc)} {pct(r.inc)}</span></td>
                    <td className="col-input">
                      <input type="number" step="0.01" min="0"
                        value={d.cifEA !== undefined ? d.cifEA : r.cifEA}
                        onChange={e => updateDecision(r.id, 'cifEA', e.target.value)} />
                    </td>
                    <td className="col-num">{dollars(r.tanyEA)}</td>
                    <td className="col-num"><span className={marginClass(r.prevMargin)}>{marginIcon(r.prevMargin)} {pct(r.prevMargin)}</span></td>
                    <td className="col-num"><span className={marginClass(tanyMargin)}>{marginIcon(tanyMargin)} {pct(tanyMargin)}</span></td>
                    <td className="col-num"><span className={dropClass(r.marginDrop)}>{pctSigned(r.marginDrop)}</span></td>
                    <td className="col-num">{r.srp > 0 ? dollars(r.srp) : '—'}</td>
                    <td className="col-num">
                      {r.srp > 0 ? <span className={marginClass(r.srpMargin)}>{marginIcon(r.srpMargin)} {pct(r.srpMargin)}</span> : '—'}
                    </td>
                    <td className="col-action">
                      <select value={d.decision || 'pending'} onChange={e => updateDecision(r.id, 'decision', e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="yes">Yes — change</option>
                        <option value="no">No — keep</option>
                      </select>
                    </td>
                    <td className="col-input">
                      <input type="number" step="0.01" min="0" placeholder="0.00"
                        value={d.newPrice || ''} onChange={e => updateDecision(r.id, 'newPrice', e.target.value)} />
                    </td>
                    <td className="col-num">
                      {newMargin !== null ? <span className={marginClass(newMargin)}>{marginIcon(newMargin)} {pct(newMargin)}</span> : '—'}
                    </td>
                    <td className="col-input">
                      <input type="number" step="0.01" min="0" placeholder="0.00"
                        value={d.sugSrp || ''} onChange={e => updateDecision(r.id, 'sugSrp', e.target.value)} />
                    </td>
                    <td className="col-num">
                      {srpMargin !== null ? <span className={marginClass(srpMargin)}>{marginIcon(srpMargin)} {pct(srpMargin)}</span> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
