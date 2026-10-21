import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation Bar Component
 * Displays application links, current user name, role tag, and logout button.
 * Only rendered when a user is authenticated.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Show navbar only when logged in
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <NavLink to="/" className="nav-brand">
          <span className="nav-brand-icon">🌊</span>
          <span>FloodWatch</span>
        </NavLink>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Map
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/zones"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Zones
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Alerts
            </NavLink>
          </li>
        </ul>

        {/* User Info & Logout */}
        <div className="nav-user-section">
          <div className="user-badge">
            <span className="user-name">{user.name}</span>
            <span className="role-tag">{user.role}</span>
          </div>
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title="Log out of your session"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
