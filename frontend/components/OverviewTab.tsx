import type { ReviewReport } from "@/lib/types";

interface OverviewTabProps {
  report: ReviewReport;
}

export function OverviewTab({ report }: OverviewTabProps) {
  const { health_score, summary, context } = report;
  const cls = health_score >= 80 ? "good" : health_score >= 60 ? "ok" : "bad";
  const circ = 2 * Math.PI * 54;
  const offset = circ - (health_score / 100) * circ;

  return (
    <div className="scroll">
      <div className="card score-card">
        <div className="score-ring">
          <svg width={140} height={140} viewBox="0 0 140 140" className="score-ring-svg">
            <circle className="bg" cx={70} cy={70} r={54} />
            <circle
              className={`progress ${cls}`}
              cx={70}
              cy={70}
              r={54}
              stroke={`url(#g-${cls})`}
              strokeDasharray={circ}
              strokeDashoffset={offset}
            />
          </svg>
          <div className={`score-num ${cls}`}>{health_score}</div>
        </div>
        <div className="score-label">Health Score</div>
      </div>
      <div className="card">
        <div className="info-row">
          <div className="info-label">Language</div>
          <div className="info-value">
            <span className="lang-tag">{context.language ?? "Unknown"}</span>
          </div>
        </div>
        {context.framework && (
          <div className="info-row">
            <div className="info-label">Framework</div>
            <div className="info-value">{context.framework}</div>
          </div>
        )}
        <div className="info-row">
          <div className="info-label">Purpose</div>
          <div className="info-value">{context.purpose ?? "N/A"}</div>
        </div>
      </div>
      <div className="section-title">Issues by Severity</div>
      <div className="stats">
        <div className="stat">
          <div className="stat-val critical">{summary.critical}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat">
          <div className="stat-val high">{summary.high}</div>
          <div className="stat-label">High</div>
        </div>
        <div className="stat">
          <div className="stat-val medium">{summary.medium}</div>
          <div className="stat-label">Medium</div>
        </div>
        <div className="stat">
          <div className="stat-val low">{summary.low}</div>
          <div className="stat-label">Low</div>
        </div>
      </div>
      <div className="section-title">Issues by Category</div>
      <div className="cat-grid">
        <div className="cat-card">
          <div className="cat-icon bugs">🐛</div>
          <div>
            <div className="cat-name">Bugs</div>
            <div className="cat-count">{summary.by_category.bugs}</div>
          </div>
        </div>
        <div className="cat-card">
          <div className="cat-icon security">🔒</div>
          <div>
            <div className="cat-name">Security</div>
            <div className="cat-count">{summary.by_category.security}</div>
          </div>
        </div>
        <div className="cat-card">
          <div className="cat-icon perf">⚡</div>
          <div>
            <div className="cat-name">Performance</div>
            <div className="cat-count">{summary.by_category.performance}</div>
          </div>
        </div>
        <div className="cat-card">
          <div className="cat-icon style">🎨</div>
          <div>
            <div className="cat-name">Style</div>
            <div className="cat-count">{summary.by_category.style}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
