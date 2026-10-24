import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeStates, normalize } from './merge.js';

const CODE_KEY = 'sculpt.sync';

export const getCode = () => {
  try { return window.localStorage.getItem(CODE_KEY) || ''; } catch (e) { return ''; }
};
export const saveCode = (c) => {
  try { c ? window.localStorage.setItem(CODE_KEY, c) : window.localStorage.removeItem(CODE_KEY); } catch (e) { /* ignore */ }
};

export function newCode() {
  const a = new Uint8Array(16);
  window.crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function call(code, opts = {}) {
  const r = await fetch('/api/sync', {
    ...opts,
    headers: { 'x-sync-code': code, 'content-type': 'application/json', ...(opts.headers || {}) }
  });
  if (r.status === 501 || r.status === 404) throw new Error('Cloud sync isn’t set up on this deployment yet.');
  if (!r.ok) {
    let m = 'Sync failed (' + r.status + ')';
    try { const j = await r.json(); if (j.error) m = j.error; } catch (e) { /* keep default */ }
    throw new Error(m);
  }
  return r.json();
}
export const pull = async (code) => (await call(code)).data;
export const push = (code, data) => call(code, { method: 'PUT', body: JSON.stringify({ data }) });

// Keeps this phone and the cloud copy merged. Nothing is ever overwritten blindly:
// both copies are merged record by record (newest record wins) before saving.
export function useSync(state, dispatch) {
  const [code, setCodeState] = useState(getCode);
  const [status, setStatus] = useState({ kind: getCode() ? 'idle' : 'off' });
  const stateRef = useRef(state);
  stateRef.current = state;

  const setCode = (c) => {
    saveCode(c);
    setCodeState(c);
    setStatus({ kind: c ? 'idle' : 'off' });
  };

  const run = useCallback(async () => {
    if (!code) return;
    setStatus({ kind: 'syncing' });
    try {
      const remote = await pull(code);
      const local = stateRef.current;
      const merged = mergeStates(local, remote ? normalize(remote) : null);
      if (JSON.stringify(merged) !== JSON.stringify(local)) dispatch({ type: 'replace', state: merged });
      await push(code, merged);
      setStatus({ kind: 'ok', at: Date.now() });
    } catch (e) {
      setStatus({ kind: 'error', msg: e.message });
    }
  }, [code, dispatch]);

  useEffect(() => {
    if (!code) return undefined;
    const id = setTimeout(run, 2000);
    return () => clearTimeout(id);
  }, [code, state.t, run]);

  useEffect(() => {
    if (!code) return undefined;
    const onVis = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [code, run]);

  return { code, setCode, status, syncNow: run };
}
