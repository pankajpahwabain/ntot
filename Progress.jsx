import { useState } from 'react';
import LineChart from './Chart.jsx';
import { ALL_SESSION_DAYS, TRACK_NAMES, TRAINING_DAYS } from './plan.js';
import { liftSeries, loggedTracks, movingAverage, workingSets } from './progress.js';
import { num, toISODate } from './calc.js';

const DAY_LABEL = { mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S' };
const fmt = (n, d = 1) => (Number.isInteger(n) ? String(n) : n.toFixed(d));

function weekVolume(state, week) {
  let v = 0;
  for (const e of Object.values(state.logs)) {
    if (e.week !== week) continue;
    for (const s of workingSets(e)) v += s.w * s.r;
  }
  return Math.round(v);
}

export default function Progress({ state, dispatch, week }) {
  const tracks = loggedTracks(state);
  const [track, setTrack] = useState('squat');
  const active = tracks.includes(track) ? track : tracks[0] || track;
  const series = liftSeries(state, active);
  const weighted = series.some((p) => p.top > 0);

  const workoutsDone = Object.entries(state.sessions).filter(([k, s]) => s.done && TRAINING_DAYS.includes(k.split('.')[1])).length;
  const weeksFull = (w) => TRAINING_DAYS.filter((d) => state.sessions[`${w}.${d}`]?.done).length;
  let streak = 0;
  for (let w = week; w >= 1; w--) {
    if (weeksFull(w) >= 4) streak++;
    else if (w !== week) break;
  }

  const body = state.body.filter((b) => !b.deleted);
  const weightPts = body.filter((b) => num(b.weight) > 0).map((b) => ({ date: b.date, y: num(b.weight) }));
  const toX = (date) => Math.round(new Date(date).getTime() / 86400000);
  const lbl = (date) => date.slice(5);
  const weightRaw = weightPts.map((p) => ({ x: toX(p.date), y: p.y, label: lbl(p.date) }));
  const weightAvg = movingAverage(weightPts).map((p) => ({ x: toX(p.date), y: p.y, label: lbl(p.date) }));
  const measure = (field) => body.filter((b) => num(b[field]) > 0).map((b) => ({ x: toX(b.date), y: num(b[field]), label: lbl(b.date) }));
  const firstW = weightPts[0]?.y;
  const lastAvg = weightAvg[weightAvg.length - 1]?.y;

  const [form, setForm] = useState({ date: toISODate(), weight: '', waist: '', hips: '', thigh: '' });
  const submit = (e) => {
    e.preventDefault();
    const entry = { date: form.date || toISODate() };
    let any = false;
    for (const f of ['weight', 'waist', 'hips', 'thigh']) {
      const v = num(form[f]);
      entry[f] = v > 0 ? v : null;
      if (v > 0) any = true;
    }
    if (!any) return;
    dispatch({ type: 'bodyAdd', entry });
    setForm({ date: toISODate(), weight: '', waist: '', hips: '', thigh: '' });
  };

  return (
    <div className="screen">
      <section className="tiles">
        <div className="tile"><b>{workoutsDone}</b><span>of 60 workouts done</span></div>
        <div className="tile"><b>{streak}</b><span>week streak (4+ workouts)</span></div>
        <div className="tile"><b>{weekVolume(state, week).toLocaleString()}</b><span>kg lifted in week {week}</span></div>
      </section>

      <section className="panel">
        <h2>Consistency</h2>
        <div className="grid12" role="img" aria-label="Sessions completed across 12 weeks">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
            <div key={w} className={'gcol' + (w === week ? ' now' : '')}>
              <span className="gw">{w}</span>
              {ALL_SESSION_DAYS.map((d) => (
                <i key={d} title={`Week ${w} ${d}`} className={state.sessions[`${w}.${d}`]?.done ? 'on' : ''} />
              ))}
            </div>
          ))}
        </div>
        <p className="legend-row">Rows: {ALL_SESSION_DAYS.map((d) => DAY_LABEL[d]).join(' ')} (Mon to Sat). Filled means done.</p>
      </section>

      <section className="panel">
        <h2>Lift progress</h2>
        {tracks.length === 0 ? (
          <p className="empty">Log your first workout and your lifts will chart here week by week.</p>
        ) : (
          <>
            <label className="select">
              <span>Exercise</span>
              <select value={active} onChange={(e) => setTrack(e.target.value)}>
                {tracks.map((t) => <option key={t} value={t}>{TRACK_NAMES[t] || t}</option>)}
              </select>
            </label>
            <LineChart
              ariaLabel={`${TRACK_NAMES[active] || active} progress by week`}
              decimals={weighted ? 1 : 0}
              series={[{
                name: weighted ? 'Top weight (kg)' : 'Best reps', color: 'var(--accent)',
                points: series.map((p) => ({ x: p.week, y: weighted ? p.top : p.reps, label: 'W' + p.week }))
              }]}
            />
            <table className="mini-table">
              <thead><tr><th>Week</th><th>{weighted ? 'Top weight' : 'Best reps'}</th>{weighted && <th>Est. 1-rep max</th>}</tr></thead>
              <tbody>
                {series.slice().reverse().slice(0, 6).map((p) => (
                  <tr key={p.week}><td>{p.week}</td><td>{weighted ? fmt(p.top) + ' kg' : p.reps}</td>{weighted && <td>{fmt(p.e1, 0)} kg</td>}</tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className="panel">
        <h2>Body check-in</h2>
        <p className="sub">Weigh in as often as you like. The chart smooths daily changes into a 7-day average. Measure waist, hips and thigh about once a month.</p>
        <form className="body-form" onSubmit={submit}>
          <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label>Weight (kg)<input inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
          <label>Waist (cm)<input inputMode="decimal" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} /></label>
          <label>Hips (cm)<input inputMode="decimal" value={form.hips} onChange={(e) => setForm({ ...form, hips: e.target.value })} /></label>
          <label>Thigh (cm)<input inputMode="decimal" value={form.thigh} onChange={(e) => setForm({ ...form, thigh: e.target.value })} /></label>
          <button type="submit" className="btn primary">Save check-in</button>
        </form>

        {weightPts.length > 0 && (
          <>
            <h3>Weight</h3>
            <LineChart ariaLabel="Body weight over time" series={[
              { name: 'Daily', color: 'var(--muted)', points: weightRaw, thin: true, dashed: true },
              { name: '7-day average', color: 'var(--accent)', points: weightAvg, hidePoints: true }
            ]} />
            <p className="sub">Start {fmt(firstW)} kg, 7-day average now {fmt(lastAvg)} kg ({lastAvg - firstW >= 0 ? '+' : ''}{fmt(lastAvg - firstW)} kg).</p>
          </>
        )}
        {['waist', 'hips', 'thigh'].map((f) => measure(f).length > 0 && (
          <div key={f}>
            <h3>{f[0].toUpperCase() + f.slice(1)} (cm)</h3>
            <LineChart ariaLabel={`${f} over time`} series={[{ name: f, color: 'var(--accent)', points: measure(f) }]} />
          </div>
        ))}

        {body.length > 0 && (
          <ul className="entries">
            {body.slice().reverse().slice(0, 8).map((b) => (
              <li key={b.id}>
                <span>{b.date}</span>
                <span>{[b.weight && b.weight + ' kg', b.waist && 'waist ' + b.waist, b.hips && 'hips ' + b.hips, b.thigh && 'thigh ' + b.thigh].filter(Boolean).join(', ')}</span>
                <button type="button" className="mini" onClick={() => dispatch({ type: 'bodyDel', id: b.id })} aria-label={`Delete check-in from ${b.date}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
