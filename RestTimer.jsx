import { useEffect, useState } from 'react';

export default function RestTimer({ timer, onChange }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timer]);

  const left = timer ? Math.max(0, Math.ceil((timer.end - now) / 1000)) : 0;
  const done = timer && left === 0;

  useEffect(() => {
    if (done && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }, [done]);

  if (!timer) return null;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className={'timer' + (done ? ' done' : '')} role="timer" aria-live="off">
      <div className="timer-time">{done ? 'Rest over' : `${mm}:${ss}`}</div>
      <div className="timer-label">{timer.label}</div>
      <button type="button" onClick={() => onChange({ ...timer, end: timer.end + 15000 })}>+15s</button>
      <button type="button" onClick={() => onChange(null)}>{done ? 'Close' : 'Skip'}</button>
    </div>
  );
}
