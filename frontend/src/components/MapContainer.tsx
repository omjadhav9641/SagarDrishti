import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Polygon, Polyline, CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IncidentData, VesselCandidate } from '../types';
import { MapLayerState } from './LayerControls';

interface MapViewProps {
  incident: IncidentData;
  layers: MapLayerState;
  selectedVessel: VesselCandidate | null;
  onSelectVessel: (vessel: VesselCandidate) => void;
}

// Controller component to smoothly pan map when selected vessel changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
};

// Ocean Boundary Geometry Clipping Helper
function getApproxCoastlineLon(lat: number): number {
  if (lat >= 18.0 && lat <= 19.5) {
    return 72.86 - (lat - 18.0) * 0.04;
  } else if (lat >= 15.0 && lat < 18.0) {
    return 73.4 - (lat - 15.0) * 0.17;
  } else if (lat > 19.5 && lat <= 23.0) {
    return 72.70 - (lat - 19.5) * 0.10;
  } else if (lat >= 8.0 && lat < 15.0) {
    return 76.5 - (lat - 8.0) * 0.44;
  }
  return 72.84;
}

function isPointInOcean(lat: number, lon: number): boolean {
  return lon <= getApproxCoastlineLon(lat);
}

function clipPathToOcean(coords: [number, number][]): [number, number][] {
  const clipped: [number, number][] = [];
  for (const [lat, lon] of coords) {
    if (isPointInOcean(lat, lon)) {
      clipped.push([lat, lon]);
    } else {
      const coastLon = getApproxCoastlineLon(lat);
      clipped.push([lat, coastLon]);
      break; // Terminate line right at the coastline!
    }
  }
  return clipped;
}

// Helper function to generate custom DivIcons for vessels
const createVesselIcon = (priority: string, isSelected: boolean) => {
  let color = '#3b82f6';
  let glow = 'rgba(59, 130, 246, 0.5)';
  if (priority === 'HIGH') {
    color = '#ef4444';
    glow = 'rgba(239, 68, 68, 0.8)';
  } else if (priority === 'MEDIUM') {
    color = '#f59e0b';
    glow = 'rgba(245, 158, 11, 0.6)';
  }

  if (isSelected) {
    color = '#0d9488';
    glow = 'rgba(13, 148, 136, 0.9)';
  }

  const svgHtml = `
    <div style="
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color};
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px ${glow};
      cursor: pointer;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'vessel-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const MapContainer: React.FC<MapViewProps> = ({
  incident,
  layers,
  selectedVessel,
  onSelectVessel
}) => {
  const centerLat = incident?.detection?.centroid?.lat || 18.523;
  const centerLon = incident?.detection?.centroid?.lon || 72.812;

  const selPos = selectedVessel?.closest_position || selectedVessel?.positions?.[0];
  const mapCenter: [number, number] = (selPos && selPos.lat && selPos.lon)
    ? [selPos.lat, selPos.lon]
    : [centerLat, centerLon];

  // Raw backtrack line coords clipped at coastline
  const rawBacktrack: [number, number][] = (incident?.drift?.backcast?.backtrack_trajectory || []).map(
    pt => [pt.lat, pt.lon] as [number, number]
  );
  const backtrackCoords = clipPathToOcean(rawBacktrack);

  // Raw forecast line coords clipped at coastline
  const rawForecast: [number, number][] = [
    [centerLat, centerLon],
    ...(incident?.drift?.forecast || []).map(f => [f.predicted_lat, f.predicted_lon] as [number, number])
  ];
  const forecastCoords = clipPathToOcean(rawForecast);

  // Origin polygon coords
  const originPolygonCoords: [number, number][] = (incident?.drift?.backcast?.probable_origin?.polygon || []).map(
    pt => [pt[0], pt[1]] as [number, number]
  );

  // Spill polygon coords
  const spillPolygonCoords: [number, number][] = (incident?.detection?.polygon || []).map(
    pt => [pt[0], pt[1]] as [number, number]
  );

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-md">
      <LeafletMap
        center={[centerLat, centerLon]}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapRecenter center={mapCenter} />

        {/* Clean, High-Resolution OpenStreetMap Light Tile Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* 1. Oil Spill Polygon Layer */}
        {layers.showSpill && spillPolygonCoords.length > 0 && (
          <Polygon
            positions={spillPolygonCoords}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#ef4444',
              fillOpacity: 0.65 * (layers.sarOpacity || 0.65),
              weight: 2.5
            }}
          >
            <Tooltip permanent={false}>
              <div className="font-sans text-xs p-1 text-slate-800">
                <strong className="text-rose-600">Oil Spill Slick ({incident.incident_id})</strong><br />
                Area: {incident.detection?.area_km2} km²<br />
                Centroid: {centerLat}°N, {centerLon}°E
              </div>
            </Tooltip>
          </Polygon>
        )}

        {/* 2. Monte Carlo Probability Cone Layer */}
        {layers.showOrigin && incident?.drift?.monte_carlo_cone?.cone_boundary && (
          <Polygon
            positions={(incident.drift.monte_carlo_cone.cone_boundary || []).map(pt => [pt[0], pt[1]] as [number, number])}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          >
            <Tooltip>
              <span className="font-sans text-xs text-teal-900 font-semibold">
                Monte Carlo Ensemble Probability Cone ({incident.drift.monte_carlo_cone.num_realizations || 15} realizations, {incident.drift.monte_carlo_cone.origin_confidence_pct || 78.5}% confidence)
              </span>
            </Tooltip>
          </Polygon>
        )}

        {/* Monte Carlo Particle Trajectories */}
        {layers.showOrigin && (incident?.drift?.monte_carlo_cone?.particles || []).map((particleTrack, pIdx) => {
          const pCoords: [number, number][] = particleTrack.map(pt => [pt.lat, pt.lon] as [number, number]);
          const clippedPCoords = clipPathToOcean(pCoords);
          return (
            <Polyline
              key={`mc-part-${pIdx}`}
              positions={clippedPCoords}
              pathOptions={{
                color: '#0d9488',
                weight: 1,
                opacity: 0.35,
                dashArray: '2, 4'
              }}
            />
          );
        })}

        {/* 2b. Probable Origin Zone Center Layer */}
        {layers.showOrigin && originPolygonCoords.length > 0 && (
          <Polygon
            positions={originPolygonCoords}
            pathOptions={{
              color: '#d97706',
              fillColor: '#f59e0b',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '6, 6'
            }}
          >
            <Tooltip permanent={true} direction="center" className="font-sans bg-white border border-amber-500 text-amber-900 text-xs font-bold shadow-md">
              <span>📍 PROBABLE ORIGIN ZONE (±2.0 km)</span>
            </Tooltip>
          </Polygon>
        )}

        {/* 3. Backtracked Drift Trajectory Line (Ocean Constrained) */}
        {layers.showBackcast && backtrackCoords.length > 0 && (
          <>
            <Polyline
              positions={backtrackCoords}
              pathOptions={{
                color: '#0d9488',
                weight: 3,
                dashArray: '8, 8'
              }}
            />
            {backtrackCoords.map((pt, idx) => (
              <CircleMarker
                key={idx}
                center={pt}
                radius={4}
                pathOptions={{ color: '#0d9488', fillColor: '#ffffff', fillOpacity: 1.0 }}
              >
                <Tooltip>
                  <span className="font-sans text-xs text-slate-800">Backtrack Step ({pt[0]}°N, {pt[1]}°E)</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </>
        )}

        {/* 4. Forecast Drift Trajectory Line (Ocean Constrained) */}
        {layers.showForecast && forecastCoords.length > 0 && (
          <>
            <Polyline
              positions={forecastCoords}
              pathOptions={{
                color: '#1e3a8a',
                weight: 2.5,
                dashArray: '4, 4'
              }}
            />
            {(incident.drift?.forecast || []).map((f, idx) => (
              <Polygon
                key={idx}
                positions={(f.polygon || []).map(pt => [pt[0], pt[1]] as [number, number])}
                pathOptions={{ color: '#1e3a8a', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1, dashArray: '3, 3' }}
              >
                <Tooltip>
                  <span className="font-sans text-xs text-slate-800">Forecast +{f.hours_ahead}h ({f.confidence} confidence)</span>
                </Tooltip>
              </Polygon>
            ))}
          </>
        )}

        {/* 5. Candidate Vessels & Trajectories (Ocean Constrained) */}
        {layers.showVessels && (incident.ranked_vessels || []).map((vessel) => {
          const isSelected = selectedVessel?.mmsi === vessel.mmsi;
          const rawTrack: [number, number][] = (vessel.positions || []).map(p => [p.lat, p.lon] as [number, number]);
          const trackCoords = clipPathToOcean(rawTrack);
          const currentPos = vessel.closest_position || vessel.positions?.[0] || { lat: centerLat, lon: centerLon, sog: 0, cog: 0, timestamp: '' };

          let markerColor = '#3b82f6';
          if (vessel.investigation_priority === 'HIGH') markerColor = '#ef4444';
          else if (vessel.investigation_priority === 'MEDIUM') markerColor = '#f59e0b';

          const vesselIcon = createVesselIcon(vessel.investigation_priority, isSelected);

          return (
            <React.Fragment key={vessel.mmsi}>
              {/* Vessel Track Line */}
              {trackCoords.length > 0 && (
                <Polyline
                  positions={trackCoords}
                  pathOptions={{
                    color: isSelected ? '#0d9488' : markerColor,
                    weight: isSelected ? 4 : 2,
                    opacity: isSelected ? 1.0 : 0.65
                  }}
                />
              )}

              {/* Vessel Positions along track */}
              {trackCoords.map((pos, pIdx) => (
                <CircleMarker
                  key={pIdx}
                  center={pos}
                  radius={pIdx === trackCoords.length - 1 ? 6 : 3}
                  pathOptions={{
                    color: isSelected ? '#0d9488' : markerColor,
                    fillColor: isSelected ? '#0d9488' : markerColor,
                    fillOpacity: isSelected ? 1.0 : 0.7
                  }}
                  eventHandlers={{
                    click: () => onSelectVessel(vessel)
                  }}
                >
                  <Tooltip>
                    <div className="font-sans text-xs p-1 text-slate-800">
                      <strong>{vessel.vessel_name} ({vessel.vessel_type})</strong><br />
                      Pos: {pos[0]}°N, {pos[1]}°E
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

              {/* Vessel Marker with Custom Icon */}
              <Marker
                position={[currentPos.lat, currentPos.lon]}
                icon={vesselIcon}
                eventHandlers={{
                  click: () => onSelectVessel(vessel)
                }}
              >
                <Popup>
                  <div className="font-sans text-xs space-y-1.5 p-1 text-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-900 text-sm">{vessel.vessel_name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          vessel.investigation_priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : vessel.investigation_priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {vessel.investigation_priority} PRIORITY
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <div>MMSI: <strong className="text-teal-700">{vessel.mmsi}</strong></div>
                      <div>Type: {vessel.vessel_type} ({vessel.flag || 'Panama'})</div>
                      <div>Correlation Score: <strong className="text-rose-600 text-sm">{vessel.correlation_score}/100</strong></div>
                      <div>Distance to Origin: <strong className="text-amber-700">{vessel.min_distance_to_origin_km} km</strong></div>
                      <div>Closest Time: {currentPos.timestamp.includes('T') ? currentPos.timestamp.split('T')[1].slice(0, 5) : currentPos.timestamp} UTC</div>
                      <div>Speed / Course: {currentPos.sog} kts @ {currentPos.cog}°</div>
                    </div>

                    <button
                      onClick={() => onSelectVessel(vessel)}
                      className="w-full mt-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded text-[11px] transition-colors"
                    >
                      Inspect Evidence
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </LeafletMap>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur p-2.5 rounded-lg border border-slate-200 text-[11px] font-sans text-slate-800 shadow-md space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">MAP LEGEND</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-teal-600 inline-block" />
          <span>Oil Spill Slick ({incident.detection?.area_km2 || 14.7} km²)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block" />
          <span>Probable Origin Zone (±2 km)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-teal-600 inline-block border-t border-dashed" />
          <span>Hindcast Drift Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-700 inline-block border-t border-dotted" />
          <span>Forecast Drift Path (+6h, +12h, +24h)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>High Priority Vessel Track</span>
        </div>
      </div>
    </div>
  );
};
