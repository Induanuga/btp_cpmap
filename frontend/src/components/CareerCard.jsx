import { useState } from 'react';

const CATEGORY_ICONS = {
  'Engineering & Tech': '💻',
  'Medical': '🏥',
  'Commerce & Management': '📊',
  'Creative Fields': '🎨',
  'Skilled Trades': '🛠️',
  'Government Jobs': '🏛️',
  'Rural / Non-traditional': '🌾',
  'Other': '🎯',
};

/** Convert a cosine similarity score (0–1) to a coloured label + bar */
function MatchScore({ score }) {
  if (score === undefined || score === null) return null;
  const pct = Math.round(score * 100);
  let color, label;

  if (pct >= 70)      { color = 'var(--success)';  label = 'Excellent'; }
  else if (pct >= 45) { color = 'var(--accent)';   label = 'Good'; }
  else if (pct >= 20) { color = 'var(--warning)';  label = 'Fair'; }
  else                { color = 'var(--text-dim)';  label = 'Low'; }

  return (
    <div style={{ minWidth: 90, textAlign: 'right' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
        {pct}%
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
        {label} Match
      </div>
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
        score: {score.toFixed(4)}
      </div>
    </div>
  );
}

export default function CareerCard({ career, rank }) {
  const [expanded, setExpanded] = useState(false);
  const icon = CATEGORY_ICONS[career.category] || '🎯';

  return (
    <div className="glass-card career-card" onClick={() => setExpanded(!expanded)}>

      {/* Rank ribbon */}
      {rank !== undefined && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          background: rank === 1
            ? 'linear-gradient(135deg,#ffd700,#ff9500)'
            : rank === 2
              ? 'linear-gradient(135deg,#c0c0c0,#888)'
              : rank === 3
                ? 'linear-gradient(135deg,#cd7f32,#a0522d)'
                : 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
          color: '#fff', fontSize: '0.68rem', fontWeight: 800,
          padding: '0.22rem 0.6rem',
          borderRadius: 'var(--radius-lg) 0 var(--radius-sm) 0',
        }}>
          #{rank}
        </div>
      )}

      <div className="career-card-header">
        <div style={{ flex: 1, marginTop: rank !== undefined ? '0.5rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <div className="career-card-title">{career.title}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{career.category}</span>
            {career.stages?.length > 0 && (
              <span className="badge badge-accent">{career.stages.length} stages</span>
            )}
          </div>
        </div>
        {/* ML match percentage */}
        <MatchScore score={career.finalScore} />
      </div>

      <p className="career-card-desc">{career.description}</p>

      {/* ML Explanation badge */}
      {career.explanation && (
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.3rem 0.6rem',
          marginBottom: '0.5rem',
          display: 'inline-block',
        }}>
          🤖 {career.explanation}
        </div>
      )}

      {career.targetSkills?.length > 0 && (
        <div className="career-card-skills">
          {career.targetSkills.slice(0, 5).map((skill) => (
            <span key={skill} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{skill}</span>
          ))}
          {career.targetSkills.length > 5 && (
            <span className="badge badge-warning" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
              +{career.targetSkills.length - 5} more
            </span>
          )}
        </div>
      )}

      <button
        className={`career-card-toggle${expanded ? ' open' : ''}`}
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        <span className="chevron">▼</span>
        {expanded ? 'Hide' : 'View'} Career Path Details
      </button>

      <div className={`career-stages-wrapper${expanded ? ' open' : ''}`}>
        {career.stages?.length > 0 && (
          <div className="career-stages">
            <div className="transitions-title" style={{ marginBottom: '0.75rem', marginTop: '1rem' }}>
              📍 Career Stages
            </div>
            {career.stages.map((stage, i) => (
              <div key={i} className="stage-item">
                <div className="stage-number">{i + 1}</div>
                <div className="stage-content">
                  <div className="stage-name">{stage.stageName}</div>
                  <div className="stage-education">🎓 {stage.education}</div>
                  {stage.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.3rem 0' }}>
                      {stage.skills.map((s) => (
                        <span key={s} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {stage.suggestions && (
                    <div className="stage-suggestions">💡 {stage.suggestions}</div>
                  )}
                  {stage.ageRange && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      🕐 {stage.ageRange}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {career.transitions?.length > 0 && (
          <div className="transitions-section">
            <div className="transitions-title">🔀 Transitions & Decision Points</div>
            {career.transitions.map((tr, i) => (
              <div key={i} className="transition-item">
                <div className="transition-route">{tr.fromStage} → {tr.toStage}</div>
                {tr.reasonChosen && (
                  <div className="transition-advice" style={{ marginBottom: '0.3rem' }}>
                    <strong>Why:</strong> {tr.reasonChosen}
                  </div>
                )}
                {tr.advice && (
                  <div className="transition-advice">
                    <strong>💡 Advice:</strong> {tr.advice}
                  </div>
                )}
                {tr.optionsAvailable?.length > 0 && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {tr.optionsAvailable.map((opt) => (
                      <span key={opt} className="badge badge-accent" style={{ fontSize: '0.68rem' }}>{opt}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
