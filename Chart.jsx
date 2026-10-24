// A small dependency-free SVG line chart.
// series: [{name, color, points:[{x, y, label}]}]
export default function LineChart({ series, height = 180, decimals = 1, ariaLabel = 'Chart' }) {
  const pts = series.flatMap((s) => s.points);
  if (pts.length === 0) return <p className="empty">Nothing to chart yet. Log a few sessions and it will appear here.</p>;

  const W = 340;
  const H = height;
  const pad = { l: 40, r: 12, t: 12, b: 26 };
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);
  const ymin = lo - span * 0.2;
  const ymax = hi + span * 0.2;
  const sx = (x) => pad.l + ((x - xmin) / (xmax - xmin || 1)) * (W - pad.l - pad.r);
  const sy = (y) => pad.t + (1 - (y - ymin) / (ymax - ymin)) * (H - pad.t - pad.b);
  const ticks = [ymin + (ymax - ymin) * 0.1, (ymin + ymax) / 2, ymax - (ymax - ymin) * 0.1];
  const labelled = [...new Map(pts.map((p) => [p.x, p])).values()].sort((a, b) => a.x - b.x);
  const showEvery = Math.ceil(labelled.length / 6);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="grid" />
            <text x={pad.l - 6} y={sy(t) + 4} textAnchor="end" className="tick">{t.toFixed(decimals)}</text>
          </g>
        ))}
        {labelled.map((p, i) =>
          i % showEvery === 0 || i === labelled.length - 1 ? (
            <text key={p.x} x={sx(p.x)} y={H - 6} textAnchor="middle" className="tick">{p.label ?? p.x}</text>
          ) : null
        )}
        {series.map((s) => (
          <g key={s.name} style={{ color: s.color }}>
            {s.points.length > 1 && (
              <polyline
                fill="none" stroke="currentColor" strokeWidth={s.thin ? 1.5 : 2.5} strokeLinejoin="round" strokeLinecap="round"
                strokeDasharray={s.dashed ? '4 4' : undefined}
                points={s.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
              />
            )}
            {!s.hidePoints && s.points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3.5" fill="currentColor" />)}
          </g>
        ))}
      </svg>
      {series.length > 1 && (
        <figcaption className="legend">
          {series.map((s) => (
            <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
