import { useState } from 'react';
import api from '../api/axios';

const GENDERS     = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const BACKGROUNDS = ['Rural', 'Urban', 'Semi-Urban', 'Tribal'];
const ECONOMICS   = ['Poor', 'Middle', 'Rich'];
const CATEGORIES  = [
  'Engineering & Tech', 'Medical', 'Commerce & Management',
  'Creative Fields', 'Skilled Trades', 'Government Jobs',
  'Rural / Non-traditional', 'Other',
];

const emptyStage = () => ({
  stageName: '', education: '', skills: '', experience: '',
  livingConditions: '', helpReceived: '', suggestions: '', ageRange: '',
});

const emptyTransition = () => ({
  fromStage: '', toStage: '', optionsAvailable: '', reasonChosen: '', mistakes: '', advice: '',
});

function TagInput({ value, onChange, placeholder, index = 0 }) {
  const tags = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const [input, setInput] = useState('');
  const id = `tag-col-${index}-${placeholder.replace(/\s+/g, '-')}`;
  const addTag = (v) => {
    const t = v.trim();
    if (t) onChange([...tags, t].join(', '));
    setInput('');
  };
  const removeTag = (idx) => {
    const copy = [...tags];
    copy.splice(idx, 1);
    onChange(copy.join(', '));
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    else if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags.length - 1);
  };
  return (
    <div className="tag-input-container" onClick={() => document.getElementById(id)?.focus()}>
      {tags.map((tag, i) => (
        <span key={i} className="tag-item">
          {tag}
          <button className="tag-remove" onClick={(e) => { e.stopPropagation(); removeTag(i); }}>×</button>
        </span>
      ))}
      <input id={id} className="tag-input-field" value={input}
        onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ''} />
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

export default function CollectorDashboard() {
  const [personal, setPersonal] = useState({
    name: '', email: '', gender: '', background: '', economicStatus: '',
    educationHistory: '', skills: '',
  });
  const [meta, setMeta]             = useState({ title: '', category: '', description: '' });
  const [stages, setStages]         = useState([emptyStage()]);
  const [transitions, setTransitions] = useState([emptyTransition()]);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3200);
  };

  const updateStage = (i, field, val) => {
    const copy = [...stages]; copy[i] = { ...copy[i], [field]: val }; setStages(copy);
  };
  const addStage    = () => setStages([...stages, emptyStage()]);
  const removeStage = (i) => { if (stages.length > 1) setStages(stages.filter((_, idx) => idx !== i)); };

  const updateTransition = (i, field, val) => {
    const copy = [...transitions]; copy[i] = { ...copy[i], [field]: val }; setTransitions(copy);
  };
  const addTransition    = () => setTransitions([...transitions, emptyTransition()]);
  const removeTransition = (i) => { if (transitions.length > 1) setTransitions(transitions.filter((_, idx) => idx !== i)); };

  const resetForm = () => {
    setPersonal({ name: '', email: '', gender: '', background: '', economicStatus: '', educationHistory: '', skills: '' });
    setMeta({ title: '', category: '', description: '' });
    setStages([emptyStage()]);
    setTransitions([emptyTransition()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meta.title.trim()) { showToast('Career title is required.', 'error'); return; }
    if (!stages[0].stageName) { showToast('At least one stage with a name is required.', 'error'); return; }

    setLoading(true);
    try {
      const parseArr = (str) => str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const payload = {
        title:                   meta.title,
        category:                meta.category || 'Other',
        description:             meta.description,
        submitterName:           personal.name,
        submitterEmail:          personal.email,
        submitterGender:         personal.gender,
        submitterEducationHistory: personal.educationHistory,
        submitterSkills:         parseArr(personal.skills),
        submitterBackground:     personal.background,
        submitterEconomicStatus: personal.economicStatus,
        stages:      stages.map((s) => ({ ...s, skills: parseArr(s.skills) })),
        transitions: transitions.map((t) => ({ ...t, optionsAvailable: parseArr(t.optionsAvailable) })),
      };
      await api.post('/career-paths/submit', payload);
      showToast('✅ Career path submitted! It will be reviewed by a moderator.', 'success');
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container cpform-page">
      <Toast msg={toast.msg} type={toast.type} />

      <div className="cpform-header">
        <h1 className="section-title" style={{ fontSize: '2rem' }}>
          📋 Collector <span className="gradient-text" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
        </h1>
        <p className="section-subtitle" style={{ marginTop: '0.4rem' }}>
          Submit career paths on behalf of individuals you've interviewed or collected data from.
          All submissions go through moderator review before being published.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Career Meta */}
        <div className="glass-card cpform-section">
          <div className="cpform-section-title">🎯 Career Information</div>
          <div className="cpform-grid">
            <div className="form-group">
              <label className="form-label">Career Title *</label>
              <input className="form-input" placeholder="e.g., Software Engineer, Doctor, CA..."
                value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group cpform-grid-full">
              <label className="form-label">Brief Description</label>
              <textarea className="form-textarea" placeholder="Summarize this career path in 1–2 sentences..."
                value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Individual's Personal Details */}
        <div className="glass-card cpform-section">
          <div className="cpform-section-title">👤 Individual's Background <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>(the person whose path you're documenting)</span></div>
          <div className="cpform-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Their name (or anonymous)"
                value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="contact@example.com"
                value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Background</label>
              <select className="form-select" value={personal.background} onChange={(e) => setPersonal({ ...personal, background: e.target.value })}>
                <option value="">Select background</option>
                {BACKGROUNDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Economic Status (childhood)</label>
              <select className="form-select" value={personal.economicStatus} onChange={(e) => setPersonal({ ...personal, economicStatus: e.target.value })}>
                <option value="">Select</option>
                {ECONOMICS.map((ec) => <option key={ec}>{ec}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Education History</label>
              <input className="form-input" placeholder="e.g., 10th → 12th MPC → BTech CSE"
                value={personal.educationHistory} onChange={(e) => setPersonal({ ...personal, educationHistory: e.target.value })} />
            </div>
            <div className="form-group cpform-grid-full">
              <label className="form-label">Skills</label>
              <TagInput value={personal.skills} onChange={(v) => setPersonal({ ...personal, skills: v })}
                placeholder="e.g., Leadership, Python, Auditing — press Enter or comma" />
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="glass-card cpform-section">
          <div className="cpform-section-title">📍 Career Stages</div>
          {stages.map((stage, i) => (
            <div key={i} className="stage-block">
              <div className="stage-block-header">
                <div className="stage-block-title">
                  <div className="stage-number" style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                  Stage {i + 1}
                </div>
                {stages.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeStage(i)}>✕ Remove</button>
                )}
              </div>
              <div className="stage-block-grid">
                <div className="form-group">
                  <label className="form-label">Stage Name *</label>
                  <input className="form-input" placeholder='e.g., "10th", "B.Tech", "First Job"'
                    value={stage.stageName} onChange={(e) => updateStage(i, 'stageName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Education at this Stage</label>
                  <input className="form-input" placeholder="e.g., B.Tech CSE at XYZ College"
                    value={stage.education} onChange={(e) => updateStage(i, 'education', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age Range</label>
                  <input className="form-input" placeholder="e.g., 18–22 years"
                    value={stage.ageRange} onChange={(e) => updateStage(i, 'ageRange', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Living Conditions</label>
                  <input className="form-input" placeholder="e.g., Hostel, Home, PG in city"
                    value={stage.livingConditions} onChange={(e) => updateStage(i, 'livingConditions', e.target.value)} />
                </div>
                <div className="form-group stage-block-full">
                  <label className="form-label">Skills Gained</label>
                  <TagInput value={stage.skills} onChange={(v) => updateStage(i, 'skills', v)} index={i}
                    placeholder="e.g., Java, Patient Care, Tax Filing..." />
                </div>
                <div className="form-group stage-block-full">
                  <label className="form-label">Experience / Internships</label>
                  <textarea className="form-textarea" placeholder="Describe work/internship experience at this stage..."
                    value={stage.experience} onChange={(e) => updateStage(i, 'experience', e.target.value)} style={{ minHeight: 70 }} />
                </div>
                <div className="form-group stage-block-full">
                  <label className="form-label">Help Received</label>
                  <input className="form-input" placeholder="e.g., Scholarship from XYZ, mentored by Prof. ABC"
                    value={stage.helpReceived} onChange={(e) => updateStage(i, 'helpReceived', e.target.value)} />
                </div>
                <div className="form-group stage-block-full">
                  <label className="form-label">💡 Suggestions for Others</label>
                  <textarea className="form-textarea" placeholder="What advice would they give someone at this stage?"
                    value={stage.suggestions} onChange={(e) => updateStage(i, 'suggestions', e.target.value)} style={{ minHeight: 70 }} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addStage}>＋ Add Another Stage</button>
        </div>

        {/* Transitions */}
        <div className="glass-card cpform-section">
          <div className="cpform-section-title">🔀 Stage Transitions</div>
          {transitions.map((tr, i) => (
            <div key={i} className="transition-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f59e0b' }}>Transition {i + 1}</div>
                {transitions.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTransition(i)}>✕</button>
                )}
              </div>
              <div className="cpform-grid">
                <div className="form-group">
                  <label className="form-label">From Stage</label>
                  <input className="form-input" placeholder='e.g., "12th BiPC"'
                    value={tr.fromStage} onChange={(e) => updateTransition(i, 'fromStage', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">To Stage</label>
                  <input className="form-input" placeholder='e.g., "MBBS"'
                    value={tr.toStage} onChange={(e) => updateTransition(i, 'toStage', e.target.value)} />
                </div>
                <div className="form-group cpform-grid-full">
                  <label className="form-label">Options Available</label>
                  <TagInput value={tr.optionsAvailable} onChange={(v) => updateTransition(i, 'optionsAvailable', v)} index={i}
                    placeholder="e.g., B.Pharm, Nursing, Direct work..." />
                </div>
                <div className="form-group cpform-grid-full">
                  <label className="form-label">Why did they choose this path?</label>
                  <textarea className="form-textarea" placeholder="Their reasoning for choosing this transition..."
                    value={tr.reasonChosen} onChange={(e) => updateTransition(i, 'reasonChosen', e.target.value)} style={{ minHeight: 60 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mistakes / Regrets</label>
                  <textarea className="form-textarea" placeholder="What would they have done differently?"
                    value={tr.mistakes} onChange={(e) => updateTransition(i, 'mistakes', e.target.value)} style={{ minHeight: 60 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">💡 Advice for Others</label>
                  <textarea className="form-textarea" placeholder="Key advice for someone at this crossroads..."
                    value={tr.advice} onChange={(e) => updateTransition(i, 'advice', e.target.value)} style={{ minHeight: 60 }} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addTransition}>＋ Add Another Transition</button>
        </div>

        <div className="cpform-submit-footer">
          <button type="button" className="btn btn-ghost" onClick={resetForm}>Reset Form</button>
          <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting…</> : '🚀 Submit Career Path'}
          </button>
        </div>
      </form>
    </div>
  );
}
