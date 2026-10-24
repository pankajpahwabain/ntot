// Small pure helpers: parsing, rounding, estimates.

export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export const roundTo = (x, step = 2.5) => Math.round(x / step) * step;

// Epley estimated one-rep max. Reps above 12 are capped so high-rep sets don't inflate it.
export const epley = (w, r) => w * (1 + Math.min(num(r), 12) / 30);

// "8-10 each leg" -> [8, 10]; "5" -> [5, 5]; "30 + 15 + 15" -> [30, 30]
export function parseRange(text) {
  const m = String(text ?? '').match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return [8, 10];
  const lo = +m[1];
  const hi = m[2] ? +m[2] : lo;
  return [lo, hi];
}

// "2 to 3 min" -> 180, "90 sec" -> 90, "60 sec after both" -> 60
export function parseRest(text) {
  const s = String(text ?? '');
  const nums = [...s.matchAll(/(\d+)/g)].map((m) => +m[1]);
  if (!nums.length) return 60;
  const n = Math.max(...nums.slice(0, 2));
  return /min/i.test(s) ? n * 60 : n;
}

export function toISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Which plan week (1 to 12) she is in, counted from her start date.
export function weekFromStart(startISO, today = new Date()) {
  if (!startISO) return 1;
  const start = new Date(startISO + 'T00:00:00');
  const t = new Date(toISODate(today) + 'T00:00:00');
  const days = Math.floor((t - start) / 86400000);
  if (days < 0) return 1;
  return Math.max(1, Math.min(12, Math.floor(days / 7) + 1));
}

// Week-1 starting weights worked out from the lifts she told us about.
// Targets about 3 reps in reserve (RPE 7) at the week-1 rep range. Everything is a starting
// estimate: the app adjusts from her real logs after the first session.
export function startWeights(lifts = {}) {
  const out = {};
  const e = (l) => (l && num(l.w) > 0 ? epley(num(l.w), num(l.r) || 8) : null);
  const forReps = (e1, reps, rir) => e1 / (1 + (reps + rir) / 30);
  const r = (x) => Math.max(5, roundTo(x));

  const sq = e(lifts.squat);
  const dl = e(lifts.deadlift);
  const ht = e(lifts.hipthrust);

  if (sq) out.squat = r(forReps(sq, 6, 3));
  if (dl) {
    out.deadlift = r(forReps(dl, 5, 3));
    out.rdl = r(0.55 * dl);
  }
  if (ht) out.hipthrust = r(forReps(ht, 9, 3));
  else if (sq) out.hipthrust = r(forReps(0.9 * sq, 9, 3));
  return out;
}
