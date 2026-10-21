import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/**
 * Flood-Prone Zones Page
 * Displays vulnerability zones linked to hydrological monitoring stations.
 * Allows administrators to add new zones and delete existing ones.
 */
const ZonesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [zones, setZones] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Add Zone Form State (Admin Only)
  const [formName, setFormName] = useState('');
  const [formRiskLevel, setFormRiskLevel] = useState('medium');
  const [formPopulation, setFormPopulation] = useState('');
  const [formStationId, setFormStationId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all zones
  const fetchZones = async () => {
    try {
      const res = await api.get('/zones');
      setZones(res.data.data || []);
    } catch (err) {
      console.error('Failed to load zones:', err);
      setError('Failed to load flood-prone zones.');
    }
  };

  // Fetch stations for the add-zone dropdown (Admin Only)
  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      const stationList = res.data.data || [];
      setStations(stationList);
      if (stationList.length > 0 && !formStationId) {
        setFormStationId(stationList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load stations for zone dropdown:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchZones();
      if (isAdmin) {
        await fetchStations();
      }
      setLoading(false);
    };

    loadData();
  }, [isAdmin]);

  // Handle Add Zone submission (Admin only)
  const handleAddZone = async (e) => {
    e.preventDefault();
    setError('');
    setActionMessage('');

    if (!formName.trim() || !formStationId) {
      setError('Please provide a zone name and select an associated station.');
      return;
    }

    try {
      setFormLoading(true);
      await api.post('/zones', {
        name: formName.trim(),
        riskLevel: formRiskLevel,
        populationAtRisk: Number(formPopulation) || 0,
        station: formStationId,
      });

      setActionMessage('New flood-prone zone added successfully!');
      setFormName('');
      setFormPopulation('');
      await fetchZones();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add zone.';
      setError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete Zone (Admin only)
  const handleDeleteZone = async (zoneId, zoneName) => {
    if (!window.confirm(`Are you sure you want to delete zone "${zoneName}"?`)) {
      return;
    }

    try {
      setError('');
      await api.delete(`/zones/${zoneId}`);
      setActionMessage(`Zone "${zoneName}" was deleted.`);
      await fetchZones();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete zone.';
      setError(msg);
    }
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Flood-Prone Zones</h1>
        <p className="page-subtitle">
          Vulnerability assessment and population risk monitoring linked to telemetry stations
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

      {/* Admin Only: Add Zone Form */}
      {isAdmin && (
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Add Flood-Prone Zone</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Register high-risk riverine settlements to monitor vulnerability and prioritize relief protocols.
          </p>

          <form onSubmit={handleAddZone}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="zone-name">
                  Zone Name
                </label>
                <input
                  id="zone-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Yamuna Khadar Settlement"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="zone-risk">
                  Risk Level
                </label>
                <select
                  id="zone-risk"
                  className="form-select"
                  value={formRiskLevel}
                  onChange={(e) => setFormRiskLevel(e.target.value)}
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="zone-population">
                  Population at Risk
                </label>
                <input
                  id="zone-population"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 12500"
                  value={formPopulation}
                  onChange={(e) => setFormPopulation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="zone-station">
                  Linked Station
                </label>
                <select
                  id="zone-station"
                  className="form-select"
                  value={formStationId}
                  onChange={(e) => setFormStationId(e.target.value)}
                  required
                >
                  <option value="">Select monitoring station...</option>
                  {stations.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.riverName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Adding Zone...' : 'Create Zone'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Zones Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading flood-prone zones...
        </div>
      ) : zones.length === 0 ? (
        <div className="empty-state">
          No flood-prone zones recorded yet.
        </div>
      ) : (
        <div className="zones-grid">
          {zones.map((zone) => {
            const station = zone.station;
            const population = zone.populationAtRisk
              ? Number(zone.populationAtRisk).toLocaleString()
              : 'Not specified';

            return (
              <div key={zone._id} className="zone-card">
                <div>
                  <div className="zone-header">
                    <h3 className="zone-name">{zone.name}</h3>
                    <span className={`risk-badge risk-${zone.riskLevel}`}>
                      {zone.riskLevel}
                    </span>
                  </div>

                  <div className="zone-details">
                    <div className="zone-detail-row">
                      <span>Linked Station</span>
                      <strong>{station?.name || 'Unassigned'}</strong>
                    </div>

                    <div className="zone-detail-row">
                      <span>River Basin</span>
                      <strong>{station?.riverName || 'N/A'}</strong>
                    </div>

                    <div className="zone-detail-row">
                      <span>Population at Risk</span>
                      <strong>{population} citizens</strong>
                    </div>

                    {station?.status && (
                      <div className="zone-detail-row">
                        <span>Current Station Status</span>
                        <span
                          className={`status-badge status-${
                            station.status === 'danger'
                              ? 'danger'
                              : station.status === 'warning'
                              ? 'warning'
                              : 'normal'
                          }`}
                        >
                          {station.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Only: Delete Zone */}
                {isAdmin && (
                  <div className="zone-footer">
                    <button
                      type="button"
                      className="btn-sm btn-delete"
                      onClick={() => handleDeleteZone(zone._id, zone.name)}
                      title="Delete this zone"
                    >
                      Delete Zone
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

export default ZonesPage;
