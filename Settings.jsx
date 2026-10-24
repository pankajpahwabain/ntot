import { useRef, useState } from 'react';
import { startWeights, num, weekFromStart } from './calc.js';
import { TRACK_NAMES } from './plan.js';
import { newCode } from './cloudsync.js';
import { normalize } from './merge.js';

const LIFTS = [
  { id: 'squat', label: 'Back squat', hint: 'A weight and the reps you can do with good form' },
  { id: 'deadlift', label: 'Deadlift', hint: 'A weight and the reps you can do with good form' },
  { id: 'hipthrust', label: 'Hip thrust (optional)', hint: 'Leave blank if you don’t know' }
];

export default function Settings({ state, dispatch, start, sync, saved }) {
  const p = state.profile;
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const setLift = (id, field, value) =>
    dispatch({ type: 'profile', patch: { lifts: { ...p.lifts, [id]: { ...(p.lifts[id] || { w: '', r: '' }), [field]: value } } } });
  const setOverride = (id, value) =>
    dispatch({ type: 'profile', patch: { overrides: { ...p.overrides, [id]: value } } });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sculpt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const importData = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = normalize(JSON.parse(String(reader.result)));
        dispatch({ type: 'merge', remote: data });
        setMsg('Backup merged. Nothing on this phone was overwritten.');
      } catch (err) {
        setMsg('That file couldn’t be read.');
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const statusText = () => {
    const s = sync.status;
    if (s.kind === 'off') return 'Cloud sync is off.';
    if (s.kind === 'syncing') return 'Syncing…';
    if (s.kind === 'ok') return 'Synced at ' + new Date(s.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.';
    if (s.kind === 'error') return 'Sync problem: ' + s.msg;
    return 'Waiting to sync.';
  };

  return (
    <div className="screen">
      <section className="panel">
        <h2>Your saved log</h2>
        <p className={saved ? 'ok' : 'bad'}>{saved ? 'Everything you log is saved on this phone as you type.' : 'Warning: this browser is blocking storage, so logs are not being saved. Turn off private browsing, or export a backup.'}</p>
        <p className="sub">Weeks carry forward automatically. Each exercise shows what you did last time and suggests the next weight.</p>
      </section>

      <section className="panel">
        <h2>Start date</h2>
        <label className="select">
          <span>Week 1 starts on</span>
          <input type="date" value={p.startDate || ''} onChange={(e) => dispatch({ type: 'profile', patch: { startDate: e.target.value || null } })} />
        </label>
        <p className="sub">{p.startDate ? `Today is in week ${weekFromStart(p.startDate)} of 12.` : 'Not set yet.'}</p>
      </section>

      <section className="panel">
        <h2>Starting weights</h2>
        <p className="sub">Tell the app what she lifts now. It works out week-1 starting weights at about 3 reps left in the tank. After the first session it uses her real logs instead.</p>
        {LIFTS.map((l) => (
          <div className="lift-row" key={l.id}>
            <label>{l.label}
              <div className="pair">
                <input inputMode="decimal" aria-label={`${l.label} weight in kg`} placeholder="kg" value={p.lifts[l.id]?.w ?? ''} onChange={(e) => setLift(l.id, 'w', e.target.value)} />
                <input inputMode="numeric" aria-label={`${l.label} reps`} placeholder="reps" value={p.lifts[l.id]?.r ?? ''} onChange={(e) => setLift(l.id, 'r', e.target.value)} />
              </div>
            </label>
          </div>
        ))}
        <h3>Week-1 estimates</h3>
        <p className="sub">Type a number to override an estimate.</p>
        {['squat', 'hipthrust', 'rdl', 'deadlift'].map((id) => {
          const est = startWeights(p.lifts)[id];
          return (
            <div className="lift-row" key={id}>
              <label>{TRACK_NAMES[id]}
                <div className="pair">
                  <input inputMode="decimal" aria-label={`${TRACK_NAMES[id]} start weight override`} placeholder={est ? String(est) : 'kg'} value={p.overrides?.[id] ?? ''} onChange={(e) => setOverride(id, e.target.value)} />
                  <span className="unit">kg</span>
                </div>
              </label>
            </div>
          );
        })}
        <p className="sub">Not sure? Leave the estimates alone. Pick weights by feel in week 1, then the app adjusts.</p>
      </section>

      <section className="panel">
        <h2>Cloud sync (optional)</h2>
        <p className="sub">Keeps her log safe if she loses her phone, and lets two devices share it. Needs the Upstash Redis add-on on Vercel (see the README).</p>
        {sync.code ? (
          <>
            <p className="code">Sync code: <code>{sync.code}</code></p>
            <p className="sub">Copy this code somewhere safe. Anyone with it can read the log. Enter the same code on a second device to share it.</p>
            <p className={sync.status.kind === 'error' ? 'bad' : 'ok'}>{statusText()}</p>
            <div className="row">
              <button type="button" className="btn" onClick={sync.syncNow}>Sync now</button>
              <button type="button" className="btn ghost" onClick={() => { if (window.confirm('Turn off cloud sync on this device? Your log stays on this phone.')) sync.setCode(''); }}>Turn off</button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="btn primary" onClick={() => sync.setCode(newCode())}>Turn on and create a sync code</button>
            <label className="select">
              <span>Or enter an existing sync code</span>
              <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="32-character code" autoCapitalize="off" />
            </label>
            <button type="button" className="btn" disabled={codeInput.trim().length < 16} onClick={() => sync.setCode(codeInput.trim())}>Use this code</button>
          </>
        )}
      </section>

      <section className="panel">
        <h2>Backup</h2>
        <div className="row">
          <button type="button" className="btn" onClick={exportData}>Export backup file</button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Import backup file</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
        {msg && <p className="ok" role="status">{msg}</p>}
        <p className="sub">Tip: export a backup once a month.</p>
      </section>

      <section className="panel danger">
        <h2>Start over</h2>
        <p className="sub">Deletes the log on this device and turns off cloud sync. Export a backup first.</p>
        <button type="button" className="btn danger-btn" onClick={() => { if (window.confirm('Delete all logs on this device? This can’t be undone.')) { sync.setCode(''); dispatch({ type: 'reset' }); } }}>Delete my log</button>
      </section>
    </div>
  );
}

export { num };
