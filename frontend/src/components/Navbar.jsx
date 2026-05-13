import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';

const ROLE_BADGE = {
  user:      { label: 'User',      color: 'var(--primary)' },
  collector: { label: 'Collector', color: '#f59e0b' },
  moderator: { label: 'Moderator', color: '#8b5cf6' },
  admin:     { label: 'Admin',     color: '#ef4444' },
};

export default function Navbar() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const user = getUser();
  const role = user?.role || 'user';
  const badge = ROLE_BADGE[role] || ROLE_BADGE.user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setProfileOpen((prev) => !prev);
  };

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to={role === 'admin' ? '/admin' : role === 'moderator' ? '/moderator' : role === 'collector' ? '/collector' : '/search'} className="navbar-brand">
          🗺️ CPMap
        </NavLink>

        <div className="navbar-links">
          {/* User & Collector: explore */}
          {(role === 'user' || role === 'admin') && (
            <NavLink to="/search" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              🔍 Explore
            </NavLink>
          )}

          {/* User: submit own path */}
          {role === 'user' && (
            <NavLink to="/cp-form" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              ✍️ Submit Path
            </NavLink>
          )}

          {/* Collector: submit paths for others */}
          {role === 'collector' && (
            <NavLink to="/collector" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              📋 Collector Dashboard
            </NavLink>
          )}

          {/* Moderator */}
          {role === 'moderator' && (
            <NavLink to="/moderator" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              🛡️ Moderation
            </NavLink>
          )}

          {/* Admin */}
          {role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              ⚙️ Admin
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
          <button className="navbar-avatar" type="button" onClick={handleAvatarClick} aria-label="Open profile menu">
            {initial}
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">Profile</div>
              <div className="profile-row">
                <span>Name</span>
                <strong>{user?.name || 'Unknown'}</strong>
              </div>
              <div className="profile-row">
                <span>Email</span>
                <strong>{user?.email || 'Unknown'}</strong>
              </div>
              <div className="profile-row">
                <span>Role</span>
                <strong>{badge.label}</strong>
              </div>
              <button className="btn btn-sm btn-block" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
