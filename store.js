import { useEffect, useReducer, useRef, useState } from 'react';
import { emptyState, mergeStates, normalize } from './merge.js';
import { toISODate } from './calc.js';

export const KEY = 'sculpt.v1';
export const BAK = 'sculpt.v1.bak';

// Reads the saved log. If the main copy is damaged it falls back to the previous copy.
export function loadState() {
  for (const k of [KEY, BAK]) {
    try {
      const raw = window.localStorage.getItem(k);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) {
      /* try the next copy */
    }
  }
  return emptyState();
}

// Writes the main copy and keeps the previous version as a backup.
export function saveState(state) {
  try {
    const json = JSON.stringify(state);
    const prev = window.localStorage.getItem(KEY);
    if (prev && prev !== json) window.localStorage.setItem(BAK, prev);
    window.localStorage.setItem(KEY, json);
    return true;
  } catch (e) {
    return false;
  }
}

export function reducer(state, a) {
  const t = Date.now();
  switch (a.type) {
    case 'set': {
      const entry = state.logs[a.key] || { week: a.week, day: a.day, slot: a.slot, track: a.track, sets: [], t: 0 };
      const sets = [...entry.sets];
      while (sets.length <= a.i) sets.push({ w: '', r: '', done: false });
      sets[a.i] = { ...sets[a.i], ...a.patch };
      return { ...state, t, logs: { ...state.logs, [a.key]: { ...entry, track: a.track, week: a.week, day: a.day, slot: a.slot, sets, t } } };
    }
    case 'setMany': {
      const logs = { ...state.logs };
      for (const item of a.items) {
        const entry = logs[item.key] || { week: item.week, day: item.day, slot: item.slot, track: item.track, sets: [], t: 0 };
        const sets = [...entry.sets];
        while (sets.length < item.n) sets.push({ w: '', r: '', done: false });
        for (let i = 0; i < item.n; i++) sets[i] = { ...sets[i], ...item.patch(sets[i], i) };
        logs[item.key] = { ...entry, track: item.track, week: item.week, day: item.day, slot: item.slot, sets, t };
      }
      return { ...state, t, logs };
    }
    case 'session': {
      const cur = state.sessions[a.key] || {};
      return { ...state, t, sessions: { ...state.sessions, [a.key]: { ...cur, ...a.patch, t } } };
    }
    case 'bodyAdd': {
      const id = 'b' + t.toString(36) + Math.random().toString(36).slice(2, 6);
      const entry = { id, date: a.entry.date || toISODate(), weight: a.entry.weight, waist: a.entry.waist, hips: a.entry.hips, thigh: a.entry.thigh, t };
      return { ...state, t, body: [...state.body, entry].sort((x, y) => (x.date < y.date ? -1 : 1)) };
    }
    case 'bodyDel':
      return { ...state, t, body: state.body.map((x) => (x.id === a.id ? { ...x, deleted: true, t } : x)) };
    case 'profile':
      return { ...state, t, profile: { ...state.profile, ...a.patch, t } };
    case 'replace':
      return normalize(a.state);
    case 'merge':
      return mergeStates(state, normalize(a.remote));
    case 'reset':
      return { ...emptyState(), t };
    default:
      return state;
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [saved, setSaved] = useState(true);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaved(saveState(state));
  }, [state]);
  return [state, dispatch, saved];
}
