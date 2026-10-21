import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="main-content">
      <div className="placeholder-page" style={{ margin: '4rem auto', maxWidth: '520px' }}>
        <div className="placeholder-icon">🔍</div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The page or monitoring resource you requested does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
