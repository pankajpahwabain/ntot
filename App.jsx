import { useEffect, useMemo, useState } from 'react';
import Train from './Train.jsx';
import Progress from './Progress.jsx';
import Guide from './Guide.jsx';
import Settings from './Settings.jsx';
import RestTimer from './RestTimer.jsx';
import { useStore } from './store.js';
import { useSync } from './cloudsync.js';
import { num, startWeights, weekFromStart } from './calc.js';

const TABS = [
  { id: 'train', label: 'Train' },
  { id: 'progress', label: 'Progress' },
  { id: 'guide', label: 'Guide' },
  { id: 'settings', label: 'Settings' }
];

export default function App() {
  const [state, dispatch, saved] = useStore();
  const sync = useSync(state, dispatch);
  const [tab, setTab] = useState('train');
  const [week, setWeek] = useState(() => weekFromStart(state.profile.startDate));
  const [timer, setTimer] = useState(null);

  // Open the right week whenever the start date changes.
  useEffect(() => {
    setWeek(weekFromStart(state.profile.startDate));
  }, [state.profile.startDate]);

  // Ask the browser not to clear her log when storage is low.
  useEffect(() => {
    try { navigator.storage?.persist?.(); } catch (e) { /* not supported */ }
  }, []);

  const start = useMemo(() => {
    const est = startWeights(state.profile.lifts);
    const out = { ...est };
    for (const [k, v] of Object.entries(state.profile.overrides || {})) {
      if (num(v) > 0) out[k] = num(v);
    }
    return out;
  }, [state.profile.lifts, state.profile.overrides]);

  const startTimer = (seconds, label) => setTimer({ end: Date.now() + seconds * 1000, label });

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Nushi to Tanoshi</h1>
          <p className="save-state" role="status">
            {saved ? 'Saved on this phone' : 'Not saving: storage blocked'}
            {sync.status.kind === 'ok' ? ', synced' : sync.status.kind === 'error' ? ', sync problem' : ''}
          </p>
        </div>
      </header>

      <main>
        {tab === 'train' && <Train state={state} dispatch={dispatch} week={week} setWeek={setWeek} start={start} startTimer={startTimer} />}
        {tab === 'progress' && <Progress state={state} dispatch={dispatch} week={week} />}
        {tab === 'guide' && <Guide />}
        {tab === 'settings' && <Settings state={state} dispatch={dispatch} start={start} sync={sync} saved={saved} />}
      </main>

      <RestTimer timer={timer} onChange={setTimer} />

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} type="button" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
    </div>
  );
}
