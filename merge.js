// Merging two copies of the state (this phone and the cloud copy) without losing anything.
// Every record carries a timestamp `t`; the newer record wins.

export function emptyState() {
  return {
    v: 1,
    t: 0,
    profile: { t: 0, startDate: null, lifts: { squat: { w: 50, r: 8 }, deadlift: { w: 80, r: 5 } }, overrides: {} },
    logs: {},
    sessions: {},
    body: []
  };
}

const newer = (a, b) => ((a?.t || 0) >= (b?.t || 0) ? a : b);

function mergeMap(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? newer(out[k], v) : v;
  return out;
}

export function mergeStates(local, remote) {
  if (!remote) return local;
  if (!local) return remote;
  const body = mergeMap(
    Object.fromEntries((local.body || []).map((x) => [x.id, x])),
    Object.fromEntries((remote.body || []).map((x) => [x.id, x]))
  );
  return {
    v: 1,
    t: Math.max(local.t || 0, remote.t || 0),
    profile: newer(local.profile, remote.profile),
    logs: mergeMap(local.logs, remote.logs),
    sessions: mergeMap(local.sessions, remote.sessions),
    body: Object.values(body).sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0))
  };
}

// Make sure anything loaded from disk, an import or the cloud has the expected shape.
export function normalize(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  return {
    v: 1,
    t: Number(raw.t) || 0,
    profile: {
      ...base.profile,
      ...(raw.profile || {}),
      lifts: { ...base.profile.lifts, ...((raw.profile || {}).lifts || {}) },
      overrides: { ...((raw.profile || {}).overrides || {}) }
    },
    logs: raw.logs && typeof raw.logs === 'object' ? raw.logs : {},
    sessions: raw.sessions && typeof raw.sessions === 'object' ? raw.sessions : {},
    body: Array.isArray(raw.body) ? raw.body.filter((x) => x && x.id && x.date) : []
  };
}
