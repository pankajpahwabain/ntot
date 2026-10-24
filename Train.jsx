import { useState } from 'react';
import {
  ALL_SESSION_DAYS, BLOCKS, DAYS, REST, TRAINING_DAYS, WARM,
  blockOf, effortLabel, exercisesFor, isDeload, isTest, pick, setsFor, variantFor, videoLinks, weekBanner
} from './plan.js';
import { suggest } from './progress.js';
import { parseRange, parseRest } from './calc.js';

const JS_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const todayKey = () => JS_DAYS[new Date().getDay()];
const fmt = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(1)));

export default function Train({ state, dispatch, week, setWeek, start, startTimer }) {
  const [day, setDay] = useState(todayKey());
  const banner = weekBanner(week);
  const hasStart = !!state.profile.startDate;

  const doneIn = (w) => ALL_SESSION_DAYS.filter((d) => state.sessions[`${w}.${d}`]?.done).length;

  return (
    <div className="screen">
      {!hasStart && (
        <section className="welcome">
          <h2>Welcome</h2>
          <p>Start the 12 weeks today and the app will keep track of which week you’re in. You can still open any week below.</p>
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'profile', patch: { startDate: new Date().toISOString().slice(0, 10) } })}>
            Start week 1 today
          </button>
        </section>
      )}

      <section aria-label="Choose a week" className="weeks">
        {BLOCKS.map((name, b) => (
          <div key={name}>
            <div className="block-label">Block {b + 1}: {name}</div>
            <div className="week-row">
              {[1, 2, 3, 4].map((i) => {
                const w = b * 4 + i;
                const done = doneIn(w);
                return (
                  <button
                    key={w} type="button" aria-pressed={w === week} aria-label={`Week ${w}, ${done} sessions done`}
                    className={'wk' + (w % 4 === 0 && w !== 12 ? ' deload' : '') + (done >= 5 ? ' full' : '')}
                    onClick={() => setWeek(w)}
                  >
                    {w}
                    {done > 0 && <span className="dot" aria-hidden="true">{done}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="banner" aria-live="polite">
        <h2>{banner.title}</h2>
        <p>{banner.text}</p>
        <p className="effort">{banner.effort}</p>
      </section>

      <div className="strip-wrap">
        <div className="strip" role="group" aria-label="Choose a day">
          {DAYS.map((d) => {
            const done = state.sessions[`${week}.${d.k}`]?.done;
            return (
              <button key={d.k} type="button" className="day" data-tag={d.tag} aria-pressed={d.k === day} onClick={() => setDay(d.k)}>
                <b>{d.label}</b>
                <span>{done ? '✓' : d.tag === 'rest' ? 'Easy' : d.tag === 'upper' ? 'Upper' : 'Lower'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <DayCard state={state} dispatch={dispatch} week={week} day={day} start={start} startTimer={startTimer} />
    </div>
  );
}

function DayCard({ state, dispatch, week, day, start, startTimer }) {
  const sKey = `${week}.${day}`;
  const sess = state.sessions[sKey] || {};
  const rest = REST[day];
  const tag = DAYS.find((d) => d.k === day).tag;

  if (rest) {
    return (
      <article className="card" data-tag="rest">
        <h2>{rest.title}</h2>
        <div className="rest-body">{rest.body.map((p) => <p key={p}>{p}</p>)}</div>
        <button type="button" className={'btn finish' + (sess.done ? ' is-done' : '')} onClick={() => dispatch({ type: 'session', key: sKey, patch: { done: !sess.done } })}>
          {sess.done ? '✓ Done. Tap to undo' : 'Mark this day done'}
        </button>
      </article>
    );
  }

  const mode = sess.mode === 'home' ? 'home' : 'gym';
  const def = exercisesFor(day, mode);

  const prefill = () => {
    const items = def.ex.map((ex) => {
      const variant = variantFor(ex, week);
      const sug = suggest(state, ex, variant, week, start, pick(ex.r, blockOf(week)));
      return {
        key: `${week}.${day}.${mode}.${ex.slot}`, week, day, slot: ex.slot, track: variant.id, n: setsFor(ex, week),
        patch: (s) => (!s.done && !String(s.w).trim() && sug.weight && (ex.log || 'wr') === 'wr' ? { w: String(sug.weight) } : {})
      };
    });
    dispatch({ type: 'setMany', items });
  };

  return (
    <article className="card" data-tag={tag}>
      <h2>{def.title}</h2>
      <p className="sub">{def.focus}</p>
      <div className="meta">
        <span>{def.time}</span>
        <span>{def.ex.length} exercises</span>
      </div>

      <div className="mode" role="group" aria-label="Where are you training?">
        <button type="button" aria-pressed={mode === 'gym'} onClick={() => dispatch({ type: 'session', key: sKey, patch: { mode: 'gym' } })}>Gym</button>
        <button type="button" aria-pressed={mode === 'home'} onClick={() => dispatch({ type: 'session', key: sKey, patch: { mode: 'home' } })}>Home</button>
      </div>

      <details className="warm">
        <summary>Warm-up</summary>
        <p>{WARM[def.warm]}</p>
      </details>

      <button type="button" className="btn ghost" onClick={prefill}>Fill in suggested weights</button>

      <ol className="list">
        {def.ex.map((ex, i) => (
          <ExerciseCard key={`${week}.${day}.${mode}.${ex.slot}`} ex={ex} index={i + 1} week={week} day={day} mode={mode} state={state} dispatch={dispatch} start={start} startTimer={startTimer} />
        ))}
      </ol>

      <div className="after">{def.after}</div>

      <label className="notes">
        <span>How did it go? (optional)</span>
        <textarea rows="2" value={sess.note || ''} placeholder="Energy, sleep, anything that felt off"
          onChange={(e) => dispatch({ type: 'session', key: sKey, patch: { note: e.target.value } })} />
      </label>

      <button type="button" className={'btn finish' + (sess.done ? ' is-done' : '')} onClick={() => dispatch({ type: 'session', key: sKey, patch: { done: !sess.done } })}>
        {sess.done ? '✓ Workout finished. Tap to undo' : 'Finish workout'}
      </button>
    </article>
  );
}

function ExerciseCard({ ex, index, week, day, mode, state, dispatch, start, startTimer }) {
  const b = blockOf(week);
  const variant = variantFor(ex, week);
  const repsText = pick(ex.r, b);
  const rest = pick(ex.rest, b);
  const note = pick(ex.note, b);
  const n = setsFor(ex, week);
  const log = ex.log || 'wr';
  const key = `${week}.${day}.${mode}.${ex.slot}`;
  const entry = state.logs[key];
  const sets = Array.from({ length: n }, (_, i) => entry?.sets?.[i] || { w: '', r: '', done: false });
  const sug = suggest(state, ex, variant, week, start, repsText);
  const [lo] = parseRange(repsText);
  const topSet = isTest(week) && ex.top;
  const labels = topSet ? ['Top set', 'Back-off', 'Back-off'] : null;
  const links = videoLinks(variant);
  const unit = log === 'time' ? 'sec' : 'reps';

  const patchSet = (i, patch) => dispatch({ type: 'set', key, week, day, slot: ex.slot, track: variant.id, i, patch });

  const toggle = (i) => {
    const s = sets[i];
    if (s.done) return patchSet(i, { done: false });
    const patch = { done: true };
    if (log === 'wr' && !String(s.w).trim() && sug.weight) patch.w = fmt(sug.weight);
    if (log !== 'check' && !String(s.r).trim()) patch.r = String(lo);
    patchSet(i, patch);
    if (rest) startTimer(parseRest(rest), variant.name.split(',')[0]);
    return undefined;
  };

  const copyLast = () => {
    dispatch({
      type: 'setMany',
      items: [{
        key, week, day, slot: ex.slot, track: variant.id, n,
        patch: (s, i) => (s.done || !sug.last?.[i] ? {} : { w: sug.last[i].w ? fmt(sug.last[i].w) : '', r: String(sug.last[i].r) })
      }]
    });
  };

  return (
    <li className="ex">
      <header>
        <span className="num">{index}</span>
        <div className="head">
          <h3>{variant.name}</h3>
          <div className="sr">{n} × {repsText}</div>
        </div>
      </header>
      <p className="note">{note}</p>

      <div className="tags">
        <span className="tag">{effortLabel(ex, week)}</span>
        {rest && <span className="tag">Rest {rest}</span>}
        {links.map((l) => (
          <a key={l.url} className="tag link" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
        ))}
      </div>

      <div className="hint">
        {sug.last ? (
          <p className="last">
            <b>Last time (week {sug.lastWeek}):</b>{' '}
            {sug.last.map((s) => (s.w ? `${fmt(s.w)} kg × ${s.r}` : `${s.r} ${unit}`)).join(', ')}
          </p>
        ) : null}
        <p className="try">
          {sug.weight ? <b>Try {fmt(sug.weight)} kg{sug.reps ? ` for ${sug.reps}` : ''}. </b> : null}
          {sug.note}
        </p>
        {sug.last && !sets.some((s) => s.done) && (
          <button type="button" className="mini" onClick={copyLast}>Copy last time’s numbers</button>
        )}
      </div>

      <div className="sets">
        {sets.map((s, i) => (
          <div key={i} className={'set' + (s.done ? ' done' : '')}>
            <span className="set-label">{labels ? labels[i] : log === 'check' ? `Round ${i + 1}` : `Set ${i + 1}`}</span>
            {log === 'wr' && (
              <label>
                <span className="sr-only">Weight for set {i + 1}</span>
                <input inputMode="decimal" placeholder={sug.weight ? fmt(sug.weight) : (ex.wLabel || 'kg')} value={s.w}
                  onChange={(e) => patchSet(i, { w: e.target.value })} />
                <small>{ex.wLabel || 'kg'}</small>
              </label>
            )}
            {log !== 'check' && (
              <label>
                <span className="sr-only">{unit} for set {i + 1}</span>
                <input inputMode="numeric" placeholder={repsText.split(' ')[0]} value={s.r}
                  onChange={(e) => patchSet(i, { r: e.target.value })} />
                <small>{unit}</small>
              </label>
            )}
            <button type="button" className="check" aria-pressed={s.done} aria-label={`Mark set ${i + 1} ${s.done ? 'not done' : 'done'}`} onClick={() => toggle(i)}>
              {s.done ? '✓' : ''}
            </button>
          </div>
        ))}
      </div>
      {log !== 'check' && !sets.some((s) => s.done) && (
        <p className="tip">Type what you did, or tap the circle to log the lowest target rep count.</p>
      )}
      {isDeload(week) && <p className="tip">Deload week: stop each set well short of failure.</p>}
    </li>
  );
}

export { TRAINING_DAYS };
