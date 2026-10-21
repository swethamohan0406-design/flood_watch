import React from 'react';

/**
 * Placeholder for Alerts Page (To be implemented in Part 3)
 */
const AlertsPage = () => {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Emergency Alerts Center</h1>
        <p className="page-subtitle">Active flood alarms, resolution controls, and incident history</p>
      </div>

      <div className="placeholder-page">
        <div className="placeholder-icon">🚨</div>
        <span className="placeholder-tag">Part 3 Module</span>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Emergency Alert Dispatch & Resolution
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
          Active alert triage, resolution logging, and emergency protocol dispatching will be completed in Part 3.
        </p>
      </div>
    </div>
  );
};

export default AlertsPage;
