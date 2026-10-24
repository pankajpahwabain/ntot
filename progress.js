import { epley, num, parseRange, roundTo } from './calc.js';
import { isDeload, isTest } from './plan.js';

// Tracks that have no history of their own borrow a starting weight from a related track.
export const DERIVE = {
  'hipthrust-pump': { from: 'hipthrust', ratio: 0.85, label: 'your heavy hip thrust' },
  deadlift: { from: 'rdl', ratio: 1.45, label: 'your Romanian deadlift' }
};

export function incrementFor(kind) {
  if (kind === 'db') return 2;
  if (kind === 'bw' || kind === 'band') return 0;
  return 2.5;
}

export const workingSets = (entry) =>
  (entry?.sets || []).filter((s) => num(s.r) > 0).map((s) => ({ w: num(s.w), r: num(s.r), done: !!s.done }));

// The most recent earlier-week, non-deload log of this tracking id.
export function lastEntry(state, track, week) {
  let best = null;
  for (const e of Object.values(state.logs || {})) {
    if (e.track !== track || !(e.week < week) || isDeload(e.week)) continue;
    if (workingSets(e).length === 0) continue;
    if (!best || e.week > best.week || (e.week === best.week && (e.t || 0) > (best.t || 0))) best = e;
  }
  return best;
}

function bestWeight(state, track, week) {
  const e = lastEntry(state, track, week);
  if (!e) return null;
  const ws = workingSets(e).filter((s) => s.w > 0);
  return ws.length ? Math.max(...ws.map((s) => s.w)) : null;
}

// What to do next time on this exercise.
// Returns {last, weight, reps, note}
//   last    previous sets [{w, r}] for the "Last time" line
//   weight  suggested weight in kg or null
//   reps    reps to aim for or null
export function suggest(state, ex, variant, week, start = {}, repsText) {
  const [lo, hi] = parseRange(repsText);
  const kind = ex.kind || 'db';
  const prev = lastEntry(state, variant.id, week);
  const out = { last: null, lastWeek: null, weight: null, reps: null, note: '' };

  if (prev) {
    const sets = workingSets(prev);
    out.last = sets.map((s) => ({ w: s.w, r: s.r }));
    out.lastWeek = prev.week;
    const weighted = sets.filter((s) => s.w > 0);

    // Bodyweight or reps-only lifts: progress by reps.
    if (weighted.length === 0) {
      const best = Math.max(...sets.map((s) => s.r));
      out.reps = Math.min(hi, best + 1);
      out.note = best >= hi
        ? 'You hit the top of the range. Slow the lowering, add a pause, or add weight.'
        : `Aim for ${out.reps} reps on your first set.`;
      if (isDeload(week)) out.note = 'Deload: keep it easy, 2 sets, stop well short of failure.';
      return out;
    }

    const topW = Math.max(...weighted.map((s) => s.w));
    const atTop = weighted.filter((s) => s.w === topW);
    const inc = incrementFor(kind) || 2.5;
    const avg = atTop.reduce((a, s) => a + s.r, 0) / atTop.length;
    const allHit = atTop.length >= Math.min(2, weighted.length) && atTop.every((s) => s.r >= hi);
    const wayOver = allHit && atTop.every((s) => s.r >= hi + 3);

    if (isDeload(week)) {
      out.weight = topW;
      out.note = 'Deload: same weight as before, only 2 sets, stop well short of failure.';
      return out;
    }
    if (isTest(week) && ex.top) {
      const e1 = Math.max(...weighted.map((s) => epley(s.w, s.r)));
      out.weight = roundTo(e1 / (1 + 6 / 30), kind === 'db' ? 1 : 2.5);
      out.reps = 5;
      out.note = 'Top set of 5 at about 1 rep left, then 2 sets about 10% lighter.';
      return out;
    }
    if (wayOver) {
      out.weight = topW + 2 * inc;
      out.reps = lo;
      out.note = 'That was easy. Take a bigger jump and aim for ' + lo + ' reps.';
    } else if (allHit) {
      out.weight = topW + inc;
      out.reps = lo;
      out.note = 'You hit the top of the range. Add weight and drop back to ' + lo + ' reps.';
    } else if (avg < lo - 2) {
      out.weight = Math.max(inc, topW - inc);
      out.reps = lo;
      out.note = 'That was heavy. Drop the weight slightly and build back up.';
    } else if (avg < lo) {
      out.weight = topW;
      out.reps = lo;
      out.note = 'Hold this weight and aim for ' + lo + ' reps on every set.';
    } else {
      out.weight = topW;
      out.reps = Math.min(hi, Math.round(avg) + 1);
      out.note = 'Same weight. Add a rep on each set.';
    }
    return out;
  }

  // No history on this exact exercise: borrow from a related one, then her starting estimate.
  const d = DERIVE[variant.id];
  if (d) {
    const base = bestWeight(state, d.from, week) ?? start[d.from];
    if (base) {
      out.weight = Math.max(5, roundTo(base * d.ratio));
      out.reps = lo;
      out.note = 'Estimated from ' + d.label + '. Adjust to how it feels.';
      return out;
    }
  }
  if (start[variant.id]) {
    out.weight = start[variant.id];
    out.reps = lo;
    out.note = 'Starting estimate from your current lifts. Adjust to how it feels.';
    return out;
  }
  out.note = kind === 'bw' || kind === 'band'
    ? 'Go for the target reps with good form.'
    : 'Pick a weight you could lift for about 3 more reps than the target.';
  return out;
}

// ---- Progress screen data

export function liftSeries(state, track) {
  const byWeek = {};
  for (const e of Object.values(state.logs || {})) {
    if (e.track !== track) continue;
    for (const s of workingSets(e)) {
      const cur = byWeek[e.week] || (byWeek[e.week] = { week: e.week, top: 0, e1: 0, reps: 0 });
      if (s.w > 0) {
        cur.top = Math.max(cur.top, s.w);
        cur.e1 = Math.max(cur.e1, epley(s.w, s.r));
      }
      cur.reps = Math.max(cur.reps, s.r);
    }
  }
  return Object.values(byWeek).sort((a, b) => a.week - b.week);
}

export function loggedTracks(state) {
  const set = new Set();
  for (const e of Object.values(state.logs || {})) {
    if (e.track && workingSets(e).length) set.add(e.track);
  }
  return [...set];
}

export function sessionsDone(state) {
  return Object.values(state.sessions || {}).filter((s) => s.done).length;
}

export function movingAverage(points, days = 7) {
  // points: [{date: 'YYYY-MM-DD', y}] sorted by date
  return points.map((p, i) => {
    const t = new Date(p.date).getTime();
    const win = points.filter((q) => {
      const tq = new Date(q.date).getTime();
      return tq <= t && t - tq < days * 86400000;
    });
    return { ...p, y: win.reduce((a, q) => a + q.y, 0) / win.length };
  });
}
