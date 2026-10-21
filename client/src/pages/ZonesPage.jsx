import React from 'react';

/**
 * Placeholder for Zones Page (To be implemented in Part 3)
 */
const ZonesPage = () => {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Flood-Prone Zones</h1>
        <p className="page-subtitle">Vulnerability assessment and population risk monitoring</p>
      </div>

      <div className="placeholder-page">
        <div className="placeholder-icon">🏘️</div>
        <span className="placeholder-tag">Part 3 Module</span>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Flood-Prone Zone Management
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
          Zone management, risk ranking, and emergency contact registries will be fully built out in Part 3.
        </p>
      </div>
    </div>
  );
};

export default ZonesPage;
