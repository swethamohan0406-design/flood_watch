import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/api';

/**
 * Dashboard Page
 * Main command center for real-time flood monitoring:
 * - 4 Key Summary Metrics
 * - 7-Day Water Level Trend Chart with Warning/Danger Thresholds
 * - Add Reading Form
 * - Monitoring Stations Status Table
 */
const Dashboard = () => {
  // Summary Metrics State
  const [summary, setSummary] = useState({
    totalStations: 0,
    activeAlerts: 0,
    stationsInDanger: 0,
    highestRainfall: 0,
  });

  // Stations & Selected Station State
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stationReadings, setStationReadings] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Add Reading Form State
  const [formStationId, setFormStationId] = useState('');
  const [formWaterLevel, setFormWaterLevel] = useState('');
  const [formRainfall, setFormRainfall] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Overall page initial loading state
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch Summary Metrics
  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      const data = res.data;
      setSummary({
        totalStations: data.totalStations ?? data.data?.totalStations ?? 0,
        activeAlerts: data.activeAlerts ?? data.data?.activeAlerts ?? 0,
        stationsInDanger: data.stationsInDanger ?? data.data?.stationsInDanger ?? 0,
        highestRainfall: data.highestRainfall ?? data.data?.highestRainfall ?? 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  };

  // Fetch All Stations
  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      const stationList = res.data.data || [];
      setStations(stationList);

      // Default the selected station if none is currently selected
      if (stationList.length > 0 && !selectedStationId) {
        setSelectedStationId(stationList[0]._id);
        setFormStationId(stationList[0]._id);
      }
      return stationList;
    } catch (err) {
      console.error('Failed to load stations:', err);
      return [];
    }
  };

  // Fetch Readings for Selected Station
  const fetchStationReadings = useCallback(async (stationId) => {
    if (!stationId) return;
    try {
      setChartLoading(true);
      const res = await api.get(`/readings/station/${stationId}`);
      setStationReadings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load station readings:', err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      const [, stationList] = await Promise.all([fetchSummary(), fetchStations()]);
      if (stationList && stationList.length > 0) {
        await fetchStationReadings(stationList[0]._id);
      }
      setInitialLoading(false);
    };
    loadInitialData();
  }, [fetchStationReadings]);

  // When dropdown selection changes, re-fetch readings
  const handleStationChange = (e) => {
    const newId = e.target.value;
    setSelectedStationId(newId);
    fetchStationReadings(newId);
  };

  // Currently selected station object
  const currentStation = stations.find((s) => s._id === selectedStationId);

  // Format readings for Recharts
  const chartData = stationReadings.map((reading) => ({
    date: new Date(reading.recordedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    time: new Date(reading.recordedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    waterLevel: reading.waterLevel,
    rainfall: reading.rainfall,
  }));

  // Handle Add Reading form submission
  const handleAddReading = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formStationId || formWaterLevel === '') {
      setFormError('Please select a station and enter the water level.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        stationId: formStationId,
        waterLevel: parseFloat(formWaterLevel),
        rainfall: formRainfall !== '' ? parseFloat(formRainfall) : 0,
      };

      await api.post('/readings', payload);

      setFormSuccess('New reading recorded successfully!');
      setFormWaterLevel('');
      setFormRainfall('');

      // Refresh summary, station table, and chart if viewing the updated station
      await Promise.all([
        fetchSummary(),
        fetchStations(),
        fetchStationReadings(selectedStationId),
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit reading.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading dashboard metrics and hydrological data...
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Page Title & Header */}
      <div className="page-header">
        <h1 className="page-title">Flood Monitoring Dashboard</h1>
        <p className="page-subtitle">
          Real-time river stage observations, alert diagnostics, and rainfall gauges
        </p>
      </div>

      {/* 4 Summary Cards */}
      <section className="summary-grid" aria-label="Summary Statistics">
        <div className="summary-card blue">
          <span className="summary-label">Total Stations</span>
          <span className="summary-value">{summary.totalStations}</span>
          <span className="summary-subtext">Active telemetry locations</span>
        </div>

        <div className="summary-card amber">
          <span className="summary-label">Active Alerts</span>
          <span className="summary-value">{summary.activeAlerts}</span>
          <span className="summary-subtext">Warnings & critical advisories</span>
        </div>

        <div className="summary-card red">
          <span className="summary-label">Stations in Danger</span>
          <span className="summary-value">{summary.stationsInDanger}</span>
          <span className="summary-subtext">Exceeding danger mark</span>
        </div>

        <div className="summary-card green">
          <span className="summary-label">Highest Rainfall</span>
          <span className="summary-value">{summary.highestRainfall} <span style={{ fontSize: '1.1rem' }}>mm</span></span>
          <span className="summary-subtext">Peak 24h precipitation</span>
        </div>
      </section>

      {/* 2-Column Grid: Trend Chart & Add Reading Form */}
      <div className="grid-2-col">
        {/* Water Level Trend Chart */}
        <section className="card">
          <div className="chart-header">
            <div>
              <h2 className="card-title" style={{ marginBottom: '0.2rem' }}>
                7-Day Water Level Trend
              </h2>
              {currentStation && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  River: <strong>{currentStation.riverName}</strong> | Warning:{' '}
                  <strong>{currentStation.warningLevel}m</strong> | Danger:{' '}
                  <strong>{currentStation.dangerLevel}m</strong>
                </p>
              )}
            </div>

            <div className="chart-select-wrapper">
              <label htmlFor="station-select" className="select-label">
                Station:
              </label>
              <select
                id="station-select"
                className="chart-select"
                value={selectedStationId}
                onChange={handleStationChange}
              >
                {stations.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.riverName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="chart-container">
            {chartLoading ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Loading telemetry chart...
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No readings recorded for this station yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    unit="m"
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            style={{
                              backgroundColor: '#ffffff',
                              padding: '0.65rem 0.9rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                              fontSize: '0.85rem',
                            }}
                          >
                            <p style={{ fontWeight: 600, color: '#0f172a' }}>{label}</p>
                            <p style={{ color: '#2563eb' }}>
                              Water Level: <strong>{payload[0].value} m</strong>
                            </p>
                            {payload[0].payload.rainfall !== undefined && (
                              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Rainfall: {payload[0].payload.rainfall} mm
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {currentStation && currentStation.warningLevel && (
                    <ReferenceLine
                      y={currentStation.warningLevel}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: `Warning (${currentStation.warningLevel}m)`,
                        fill: '#b45309',
                        position: 'insideTopLeft',
                        fontSize: 11,
                      }}
                    />
                  )}
                  {currentStation && currentStation.dangerLevel && (
                    <ReferenceLine
                      y={currentStation.dangerLevel}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `Danger (${currentStation.dangerLevel}m)`,
                        fill: '#b91c1c',
                        position: 'insideTopRight',
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="waterLevel"
                    name="Water Level (m)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Add Reading Form */}
        <section className="card">
          <h2 className="card-title">Add Reading</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Submit field telemetry. Threshold checks and alerts evaluate automatically.
          </p>

          {formError && (
            <div className="alert-box alert-error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert-box alert-success">
              <span>✅</span>
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddReading}>
            <div className="form-group">
              <label className="form-label" htmlFor="reading-station">
                Monitoring Station
              </label>
              <select
                id="reading-station"
                className="form-select"
                value={formStationId}
                onChange={(e) => setFormStationId(e.target.value)}
                required
              >
                <option value="">Select a station...</option>
                {stations.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} — {st.riverName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="water-level">
                Water Level (meters)
              </label>
              <input
                id="water-level"
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 205.50"
                value={formWaterLevel}
                onChange={(e) => setFormWaterLevel(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rainfall">
                Rainfall (mm)
              </label>
              <input
                id="rainfall"
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 45.0"
                value={formRainfall}
                onChange={(e) => setFormRainfall(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={formLoading}
            >
              {formLoading ? 'Submitting Reading...' : 'Record Reading'}
            </button>
          </form>
        </section>
      </div>

      {/* Stations Status Table */}
      <section className="card">
        <h2 className="card-title">Active Monitoring Stations</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Station Name</th>
                <th>River</th>
                <th>Current Water Level</th>
                <th>Warning Mark</th>
                <th>Danger Mark</th>
                <th>Current Rainfall</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((st) => (
                <tr key={st._id}>
                  <td style={{ fontWeight: 600 }}>{st.name}</td>
                  <td>{st.riverName}</td>
                  <td>
                    <strong>{st.currentWaterLevel ?? '—'} m</strong>
                  </td>
                  <td style={{ color: 'var(--status-warning-text)' }}>
                    {st.warningLevel} m
                  </td>
                  <td style={{ color: 'var(--status-danger-text)' }}>
                    {st.dangerLevel} m
                  </td>
                  <td>{st.currentRainfall ?? 0} mm</td>
                  <td>
                    <span
                      className={`status-badge status-${
                        st.status === 'danger'
                          ? 'danger'
                          : st.status === 'warning'
                          ? 'warning'
                          : 'normal'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stations found. Run the seed script to populate sample data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
