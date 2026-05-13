import { useState } from 'react';
import api from '../api/axios';
import CareerCard from '../components/CareerCard';

const EDUCATION_OPTIONS = [
  { value: '', label: 'Any Education Level' },
  { value: '10th', label: '10th Standard' },
  { value: '12th', label: '12th (Any Stream)' },
  { value: '12th MPC', label: '12th – MPC' },
  { value: '12th BiPC', label: '12th – BiPC' },
  { value: '12th Commerce', label: '12th – Commerce' },
  { value: 'Diploma', label: 'Diploma / Polytechnic' },
  { value: 'ITI', label: 'ITI Certificate' },
  { value: 'BTech', label: 'UG – B.Tech / B.E.' },
  { value: 'BSc', label: 'UG – B.Sc' },
  { value: 'BA', label: 'UG – B.A.' },
  { value: 'BCom', label: 'UG – B.Com / BBA' },
  { value: 'MBBS', label: 'UG – MBBS' },
  { value: 'PG', label: 'Post Graduate (any)' },
  { value: 'PhD', label: 'PhD / Research' },
];

const BACKGROUND_OPTIONS = ['Any', 'Rural', 'Urban', 'Semi-Urban', 'Tribal'];
const ECONOMIC_OPTIONS   = ['Any', 'Poor', 'Middle', 'Rich'];
const CATEGORY_FILTERS   = ['All', 'Engineering & Tech', 'Medical', 'Commerce & Management', 'Creative Fields', 'Skilled Trades', 'Government Jobs', 'Rural / Non-traditional'];

function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState('');
  const id = `tag-search-${placeholder.replace(/\s+/g, '-')}`;
  const addTag = (v) => {
    const t = v.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInput('');
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    else if (e.key === 'Backspace' && !input && tags.length > 0) setTags(tags.slice(0, -1));
  };
  return (
    <div className="tag-input-container" onClick={() => document.getElementById(id)?.focus()}>
      {tags.map((tag) => (
        <span key={tag} className="tag-item">
          {tag}
          <button className="tag-remove" onClick={(e) => { e.stopPropagation(); setTags(tags.filter((t) => t !== tag)); }}>×</button>
        </span>
      ))}
      <input id={id} className="tag-input-field" value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown} onBlur={() => input && addTag(input)} placeholder={tags.length === 0 ? placeholder : ''} />
    </div>
  );
}

export default function Search() {
  const [filters, setFilters] = useState({ education: '', background: 'Any', economic: 'Any' });
  const [skills, setSkills]   = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const params = {};
      if (filters.education) params.education = filters.education;
      if (filters.background !== 'Any') params.background = filters.background;
      if (filters.economic !== 'Any') params.economic = filters.economic;
      if (skills.length > 0) params.skills = skills.join(',');
      const res = await api.get('/career-paths/search', { params });
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search career paths. Please try again.';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ education: '', background: 'Any', economic: 'Any' });
    setSkills([]); setResults([]); setSearched(false); setCategoryFilter('All'); setError('');
  };

  const filtered = categoryFilter === 'All' ? results : results.filter((r) => r.category === categoryFilter);

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      {/* Hero */}
      <div className="search-hero">
        <h1>
          Explore <span className="gradient-text">Career Paths</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 540, lineHeight: 1.7, marginTop: '0.5rem' }}>
          Tell us about your current background and we'll show you matching career journeys with detailed
          stages, transitions, and advice from real paths.
        </p>
      </div>

      {/* Search Form */}
      <form className="glass-card search-form-card" onSubmit={handleSearch}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="section-title" style={{ fontSize: '1.1rem' }}>🔍 Your Current Profile</div>
          <div className="section-subtitle">Fill in what applies — all fields are optional</div>
        </div>

        <div className="search-form-grid">
          <div className="form-group">
            <label className="form-label">🎓 Education Level</label>
            <select className="form-select" value={filters.education}
              onChange={(e) => setFilters({ ...filters, education: e.target.value })}>
              {EDUCATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">🌍 Background</label>
            <select className="form-select" value={filters.background}
              onChange={(e) => setFilters({ ...filters, background: e.target.value })}>
              {BACKGROUND_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">💰 Economic Condition</label>
            <select className="form-select" value={filters.economic}
              onChange={(e) => setFilters({ ...filters, economic: e.target.value })}>
              {ECONOMIC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="form-group search-skills-row">
            <label className="form-label">🛠 Your Skills — press Enter or comma to add</label>
            <TagInput tags={skills} setTags={setSkills} placeholder="e.g., Java, Communication, Excel..." />
          </div>
        </div>

        <div className="search-btn-row">
          <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Searching…</> : '🔍 Find Career Paths'}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="glass-card" style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgb(220, 38, 38)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'rgb(220, 38, 38)', fontWeight: '500' }}>❌ Error: {error}</div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <>
          <div className="results-header">
            <div>
              <div className="section-title" style={{ fontSize: '1.2rem' }}>
                {loading ? 'Searching…' : `${filtered.length} Career Path${filtered.length !== 1 ? 's' : ''} Found`}
              </div>
              {!loading && results.length > 0 && (
                <div className="results-count">
                  Showing results from {results.length} matching career{results.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Category Filter */}
            {!loading && results.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {CATEGORY_FILTERS.map((cat) => (
                  <button key={cat}
                    className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setCategoryFilter(cat)}
                    style={{ fontSize: '0.75rem' }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <h3>Finding matching career paths…</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔭</div>
              <h3>No matching career paths found</h3>
              <p>Try removing some filters or searching with fewer constraints.</p>
            </div>
          ) : (
            <div className="results-grid">
              {filtered.map((career) => <CareerCard key={career._id} career={career} />)}
            </div>
          )}
        </>
      )}

      {!searched && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>Discover your career path</h3>
          <p>Enter your background above and click <strong>Find Career Paths</strong> to get started.</p>
        </div>
      )}
    </div>
  );
}
