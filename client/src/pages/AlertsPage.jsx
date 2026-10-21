import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/**
 * Emergency Alerts Center Page
 * Displays active and historical flood warnings and danger notifications.
 * Allows administrators to triage and mark active alerts as resolved.
 */
const AlertsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  // Fetch all alerts
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load alerts.');
    }
  };

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      await fetchAlerts();
      setLoading(false);
    };

    loadAlerts();
  }, []);

  // Admin action: Resolve active alert
  const handleResolveAlert = async (alertId) => {
    try {
      setResolvingId(alertId);
      setError('');
      setActionMessage('');

      await api.patch(`/alerts/${alertId}/resolve`);
      setActionMessage('Alert was marked as resolved successfully.');
      await fetchAlerts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resolve alert.';
      setError(msg);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter alerts according to current active tab
  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Emergency Alerts Center</h1>
        <p className="page-subtitle">
          Real-time hydrological alarms triggered by critical river levels and storm surges
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert-box alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="alert-box alert-success">
          <span>✅</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs / Pills */}
      <div className="alerts-filter-bar">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Alarms ({activeCount})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved Archive ({resolvedCount})
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading emergency alerts...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="empty-state">
          No {filter !== 'all' ? filter : ''} alerts found.
        </div>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map((alert) => {
            const station = alert.stationId;
            const formattedDate = new Date(alert.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={alert._id}
                className={`alert-item severity-${alert.severity} ${
                  alert.status === 'resolved' ? 'status-resolved-card' : ''
                }`}
              >
                <div className="alert-main">
                  <div className="alert-meta">
                    {/* Severity Badge */}
                    <span
                      className={`status-badge status-${
                        alert.severity === 'danger' ? 'danger' : 'warning'
                      }`}
                    >
                      {alert.severity}
                    </span>

                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor:
                          alert.status === 'active' ? '#eff6ff' : '#f1f5f9',
                        color:
                          alert.status === 'active' ? '#1d4ed8' : '#64748b',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      {alert.status}
                    </span>

                    {/* Station Name */}
                    <span className="alert-station-tag">
                      {station?.name || 'Unknown Station'}
                      {station?.riverName ? ` (${station.riverName})` : ''}
                    </span>

                    {/* Timestamp */}
                    <span className="alert-time">{formattedDate}</span>
                  </div>

                  <p className="alert-message-text">{alert.message}</p>
                </div>

                {/* Admin Actions: Resolve Button */}
                {isAdmin && alert.status === 'active' && (
                  <div className="alert-actions">
                    <button
                      type="button"
                      className="btn-sm btn-resolve"
                      onClick={() => handleResolveAlert(alert._id)}
                      disabled={resolvingId === alert._id}
                    >
                      {resolvingId === alert._id ? 'Resolving...' : 'Resolve Alert'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
