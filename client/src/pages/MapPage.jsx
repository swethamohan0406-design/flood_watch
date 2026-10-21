import React from 'react';

/**
 * Placeholder for Map Page (To be implemented in Part 3)
 */
const MapPage = () => {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Interactive Flood Map</h1>
        <p className="page-subtitle">Geospatial telemetry and station map visualization</p>
      </div>

      <div className="placeholder-page">
        <div className="placeholder-icon">🗺️</div>
        <span className="placeholder-tag">Part 3 Module</span>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Interactive Map Visualization
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
          The interactive map with coordinate markers, real-time river levels, and zone overlays will be integrated in Part 3.
        </p>
      </div>
    </div>
  );
};

export default MapPage;
