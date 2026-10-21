import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/api';

// Fix standard Leaflet marker icon asset resolution for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Return status colors for CircleMarker rendering
 * Green = Normal, Orange = Warning, Red = Danger
 */
const getStatusColors = (status) => {
  switch (status) {
    case 'danger':
      return { fill: '#dc2626', border: '#991b1b' };
    case 'warning':
      return { fill: '#d97706', border: '#92400e' };
    case 'normal':
    default:
      return { fill: '#16a34a', border: '#15803d' };
  }
};

/**
 * Interactive Geospatial Map Page
 * Displays all active river telemetry stations plotted on an OpenStreetMap base,
 * color-coded by severity status with detailed hydrometric popups.
 */
const MapPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all river monitoring stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stations');
        setStations(res.data.data || []);
      } catch (err) {
        console.error('Failed to load stations for map:', err);
        setError('Failed to load station telemetry for the map.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Interactive Flood Map</h1>
        <p className="page-subtitle">
          Geospatial visualization of river monitoring stations across India with real-time status indicators
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading geospatial telemetry and river stations...
        </div>
      ) : (
        <div className="map-wrapper">
          <MapContainer
            center={[22.5, 79.0]}
            zoom={5}
            scrollWheelZoom={true}
            className="map-container"
          >
            {/* OpenStreetMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* River Monitoring Station Circle Markers */}
            {stations.map((station) => {
              if (!station.location || !station.location.lat || !station.location.lng) {
                return null;
              }

              const colors = getStatusColors(station.status);

              return (
                <CircleMarker
                  key={station._id}
                  center={[station.location.lat, station.location.lng]}
                  radius={11}
                  pathOptions={{
                    color: colors.border,
                    fillColor: colors.fill,
                    fillOpacity: 0.88,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px', padding: '2px' }}>
                      <h3
                        style={{
                          margin: '0 0 4px',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {station.name}
                      </h3>
                      <p
                        style={{
                          margin: '0 0 8px',
                          color: '#64748b',
                          fontSize: '0.85rem',
                        }}
                      >
                        River: <strong>{station.riverName}</strong>
                      </p>

                      <div
                        style={{
                          fontSize: '0.86rem',
                          lineHeight: '1.5',
                          borderTop: '1px solid #e2e8f0',
                          paddingTop: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        <div>
                          Current Water Level:{' '}
                          <strong style={{ color: '#0f172a' }}>
                            {station.currentWaterLevel ?? '—'} m
                          </strong>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          Thresholds: Warn {station.warningLevel}m | Danger {station.dangerLevel}m
                        </div>
                        <div>
                          Precipitation:{' '}
                          <strong>{station.currentRainfall ?? 0} mm</strong>
                        </div>
                      </div>

                      <div>
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
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Map Status Legend */}
          <div className="map-legend" aria-label="Status Legend">
            <span className="legend-title">Station Status</span>
            <div className="legend-item">
              <span className="legend-dot normal"></span>
              <span>Normal Level</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot warning"></span>
              <span>Warning Threshold</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot danger"></span>
              <span>Danger Mark Exceeded</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
