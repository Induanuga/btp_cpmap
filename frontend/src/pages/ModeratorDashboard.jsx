import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

function StatusBadge({ status }) {
  const styles = {
    pending:  { background: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)'  },
    approved: { background: 'rgba(16,185,129,0.15)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.4)'  },
    rejected: { background: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)'   },
  };
  const labels = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };
  return (
    <span style={{ ...styles[status], padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
      {labels[status] || status}
    </span>
  );
}

function PathCard({ path, onModerate }) {
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    setLoading(true);
    await onModerate(path._id, status, note);
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{path.title}</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{path.category}</span>
        </div>
        <StatusBadge status={path.status} />
      </div>

      {path.description && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {path.description}
        </p>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {path.submittedBy && (
          <span>👤 Submitted by: <strong>{path.submittedBy.name}</strong> ({path.submittedBy.role})</span>
        )}
        {path.submitterName && <span>📝 Individual: <strong>{path.submitterName}</strong></span>}
        {path.submitterBackground && <span>🌍 {path.submitterBackground}</span>}
        {path.submitterEconomicStatus && <span>💰 {path.submitterEconomicStatus}</span>}
        <span>📅 {new Date(path.createdAt).toLocaleDateString()}</span>
      </div>

      {path.stages?.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Stages:</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {path.stages.map((s, i) => (
              <span key={i} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem' }}>
                {s.stageName}
              </span>
            ))}
          </div>
        </div>
      )}

      {path.status === 'pending' && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Moderation Note (optional)</label>
            <input className="form-input" style={{ fontSize: '0.85rem' }}
              placeholder="Reason for approval or rejection..."
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', fontWeight: 600 }}
              onClick={() => handleAction('approved')}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : '✅ Approve'}
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', fontWeight: 600 }}
              onClick={() => handleAction('rejected')}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : '❌ Reject'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModeratorDashboard() {
  const [paths, setPaths]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');
  const [filter, setFilter]     = useState('pending');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/career-paths/moderation-queue');
      setPaths(res.data.paths || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load paths.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPaths(); }, [fetchPaths]);

  const handleModerate = async (id, status, note) => {
    try {
      await api.patch(`/career-paths/${id}/moderate`, { status, moderationNote: note });
      showToast(`Career path ${status} successfully.`);
      // Update local state instead of full refetch
      setPaths((prev) => prev.map((p) => p._id === id ? { ...p, status } : p));
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.');
    }
  };

  const displayed = filter === 'all' ? paths : paths.filter((p) => p.status === filter);
  const counts = {
    pending:  paths.filter((p) => p.status === 'pending').length,
    approved: paths.filter((p) => p.status === 'approved').length,
    rejected: paths.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.88rem',
        }}>
          {toast}
        </div>
      )}

      <div className="search-hero">
        <h1>🛡️ <span className="gradient-text">Moderation</span></h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Review submitted career paths and approve or reject them for publication.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'pending',  label: 'Pending',  color: '#f59e0b', icon: '⏳' },
          { key: 'approved', label: 'Approved', color: '#10b981', icon: '✅' },
          { key: 'rejected', label: 'Rejected', color: '#ef4444', icon: '❌' },
        ].map(({ key, label, color, icon }) => (
          <div key={key} className="glass-card" style={{ flex: '1 1 140px', padding: '1rem 1.25rem', textAlign: 'center', cursor: 'pointer', border: filter === key ? `2px solid ${color}` : undefined }}
            onClick={() => setFilter(key)}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{counts[key]}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
        <div className="glass-card" style={{ flex: '1 1 140px', padding: '1rem 1.25rem', textAlign: 'center', cursor: 'pointer', border: filter === 'all' ? '2px solid var(--primary)' : undefined }}
          onClick={() => setFilter('all')}>
          <div style={{ fontSize: '1.5rem' }}>📋</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>{paths.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>All</div>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgb(220,38,38)', padding: '1rem', marginBottom: '1.5rem', color: 'rgb(220,38,38)' }}>
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading submissions…</h3></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No {filter === 'all' ? '' : filter} submissions</h3>
          <p>{filter === 'pending' ? 'All caught up! No paths awaiting review.' : 'Nothing here yet.'}</p>
        </div>
      ) : (
        displayed.map((path) => (
          <PathCard key={path._id} path={path} onModerate={handleModerate} />
        ))
      )}
    </div>
  );
}
