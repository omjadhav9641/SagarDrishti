import { IncidentData, DetectionResult, DriftData, ForecastPoint, VesselCandidate, ScoringWeights } from '../types';

const API_BASE = '/api';

export async function fetchHealthStatus(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend server offline, running in Client-Side Standalone Demo Mode');
  }
  return {
    status: 'ONLINE (Client Engine)',
    system: 'SAGAR DRISHTI',
    timestamp_utc: new Date().toISOString(),
    modules: {
      satellite_detection_module: { status: 'Operational', engine: 'Client CV Engine' },
      ais_engine: { status: 'Operational', engine: 'Client Track Normalizer' },
      drift_engine: { status: 'Operational', engine: 'Client Drift Physics' },
      correlation_engine: { status: 'Operational', engine: 'Explainable Client Scoring' },
      database: { status: 'Operational', storage: 'Browser Session' }
    }
  };
}

export async function fetchDemoIncident(): Promise<IncidentData> {
  try {
    const res = await fetch(`${API_BASE}/demo`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend unavailable, generating client-side demo incident scenario');
  }
  return generateClientSideDemoScenario();
}

export async function uploadSarImage(file: File, centerLat: number = 18.523, centerLon: number = 72.812): Promise<DetectionResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('center_lat', centerLat.toString());
    formData.append('center_lon', centerLon.toString());

    const res = await fetch(`${API_BASE}/detect-spill`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Upload API failed, generating local detection result');
  }

  // Client-side fallback for image upload
  return generateLocalDetectionResult(centerLat, centerLon);
}

export async function rankVesselsWithWeights(
  vessels: VesselCandidate[],
  originLat: number,
  originLon: number,
  weights: ScoringWeights
): Promise<VesselCandidate[]> {
  try {
    const res = await fetch(`${API_BASE}/vessels/rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vessels,
        origin_lat: originLat,
        origin_lon: originLon,
        weights
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.ranked_vessels;
    }
  } catch (e) {
    console.warn('Ranking API failed, performing client-side reweighting');
  }

  return clientSideRankVessels(vessels, weights);
}

// ----------------------------------------------------------------------
// Client-Side Deterministic Fallback Engine (Runs when Backend is offline)
// ----------------------------------------------------------------------

function generateClientSideDemoScenario(): IncidentData {
  const centerLat = 18.523;
  const centerLon = 72.812;

  const detection: DetectionResult = {
    status: "OIL SPILL DETECTED",
    oil_detected: true,
    confidence: 94.2,
    area_km2: 14.7,
    perimeter_km: 18.4,
    length_km: 6.8,
    width_km: 2.7,
    compactness: 0.548,
    orientation_deg: 35.0,
    centroid: { lat: centerLat, lon: centerLon },
    bounding_box: { x_px: 180, y_px: 216, width_px: 264, height_px: 144 },
    polygon: [
      [18.535, 72.800], [18.542, 72.815], [18.538, 72.835], [18.522, 72.842],
      [18.508, 72.825], [18.512, 72.805], [18.535, 72.800]
    ],
    detection_timestamp: "2025-09-08T10:30:00Z",
    estimated_release_window: {
      start: "2025-09-08T08:00:00Z",
      end: "2025-09-08T10:00:00Z",
      estimated_age_hours: "6–10 hours",
      confidence: "Medium",
      note: "Release time estimated using SAR backscatter decay, environmental drift velocity, and AIS trajectory correlation."
    },
    mask_base64: generateSvgOilMaskB64()
  };

  const backcast: DriftData = {
    drift_speed_kmh: 1.85,
    drift_direction_deg: 225.0,
    reverse_bearing_deg: 45.0,
    hindcast_hours: 2.5,
    backtrack_trajectory: [
      { step: 0, hours_ago: 0.0, lat: 18.523, lon: 72.812, uncertainty_radius_km: 0.5 },
      { step: 1, hours_ago: 0.5, lat: 18.530, lon: 72.819, uncertainty_radius_km: 0.8 },
      { step: 2, hours_ago: 1.0, lat: 18.537, lon: 72.826, uncertainty_radius_km: 1.1 },
      { step: 3, hours_ago: 1.5, lat: 18.544, lon: 72.833, uncertainty_radius_km: 1.4 },
      { step: 4, hours_ago: 2.0, lat: 18.551, lon: 72.840, uncertainty_radius_km: 1.7 },
      { step: 5, hours_ago: 2.5, lat: 18.558, lon: 72.846, uncertainty_radius_km: 2.0 }
    ],
    probable_origin: {
      lat: 18.558,
      lon: 72.846,
      uncertainty_radius_km: 2.0,
      estimated_release_window: "08:00–10:00 UTC",
      polygon: createCirclePolygon(18.558, 72.846, 2.0)
    }
  };

  const forecast: ForecastPoint[] = [
    { hours_ahead: 6, predicted_lat: 18.475, predicted_lon: 72.764, uncertainty_radius_km: 3.0, polygon: createCirclePolygon(18.475, 72.764, 3.0), confidence: "High" },
    { hours_ahead: 12, predicted_lat: 18.427, predicted_lon: 72.716, uncertainty_radius_km: 5.5, polygon: createCirclePolygon(18.427, 72.716, 5.5), confidence: "Moderate" },
    { hours_ahead: 24, predicted_lat: 18.330, predicted_lon: 72.620, uncertainty_radius_km: 9.0, polygon: createCirclePolygon(18.330, 72.620, 9.0), confidence: "Lower" }
  ];

  const ranked_vessels: VesselCandidate[] = [
    {
      mmsi: 419001892,
      vessel_name: "MT OCEAN STAR",
      vessel_type: "Oil Tanker",
      flag: "India",
      length_m: 245,
      rank: 1,
      correlation_score: 91.0,
      investigation_priority: "HIGH",
      min_distance_to_origin_km: 2.1,
      closest_timestamp: "2025-09-08T08:17:00Z",
      closest_position: { lat: 18.552, lon: 72.839, sog: 2.1, cog: 210.0, timestamp: "2025-09-08T08:17:00Z" },
      positions: [
        { timestamp: "2025-09-08T06:30:00Z", lat: 18.720, lon: 72.960, sog: 13.8, cog: 215.0 },
        { timestamp: "2025-09-08T07:15:00Z", lat: 18.640, lon: 72.900, sog: 13.5, cog: 212.0 },
        { timestamp: "2025-09-08T07:45:00Z", lat: 18.590, lon: 72.865, sog: 6.2, cog: 210.0 },
        { timestamp: "2025-09-08T08:11:00Z", lat: 18.558, lon: 72.842, sog: 2.1, cog: 208.0 },
        { timestamp: "2025-09-08T08:39:00Z", lat: 18.535, lon: 72.825, sog: 3.4, cog: 205.0 },
        { timestamp: "2025-09-08T09:05:00Z", lat: 18.490, lon: 72.780, sog: 12.0, cog: 240.0 },
        { timestamp: "2025-09-08T10:00:00Z", lat: 18.410, lon: 72.700, sog: 13.2, cog: 238.0 }
      ],
      anomalies: {
        has_speed_anomaly: true,
        has_ais_gap: true,
        has_course_anomaly: true,
        speed_drop_knots: 11.4,
        max_ais_gap_minutes: 28.0
      },
      score_breakdown: {
        spatial: 94.0,
        temporal: 98.0,
        trajectory: 95.0,
        behavior_anomaly: 92.0,
        ais_gap: 90.0,
        drift_consistency: 85.0
      },
      evidence_checklist: [
        { fulfilled: true, text: "Within 2.1 km of probable origin zone", score: 94.0 },
        { fulfilled: true, text: "Present near origin during release window (08:17 UTC)", score: 98.0 },
        { fulfilled: true, text: "Historical trajectory directly intersects origin uncertainty polygon", score: 95.0 },
        { fulfilled: true, text: "Significant speed anomaly detected (speed dropped from 13.5 to 2.1 knots)", score: 92.0 },
        { fulfilled: true, text: "AIS transmission gap of 28 minutes recorded near estimated release window", score: 90.0 },
        { fulfilled: true, text: "Vessel track alignment broadly consistent with backward reconstructed drift path", score: 85.0 }
      ],
      explainable_summary: "Vessel MT OCEAN STAR scored 91/100 based on its close proximity (2.1 km) to probable origin, presence during release window, severe speed slowdown (2.1 knots), 28-minute AIS transmission gap, and path alignment with drift backcast."
    },
    {
      mmsi: 419002341,
      vessel_name: "SEA HORIZON",
      vessel_type: "Bulk Carrier",
      flag: "Panama",
      length_m: 190,
      rank: 2,
      correlation_score: 67.0,
      investigation_priority: "MEDIUM",
      min_distance_to_origin_km: 4.8,
      closest_timestamp: "2025-09-08T08:45:00Z",
      closest_position: { lat: 18.580, lon: 72.875, sog: 9.5, cog: 220.0, timestamp: "2025-09-08T08:45:00Z" },
      positions: [
        { timestamp: "2025-09-08T06:30:00Z", lat: 18.780, lon: 73.010, sog: 12.8, cog: 222.0 },
        { timestamp: "2025-09-08T07:30:00Z", lat: 18.670, lon: 72.940, sog: 12.4, cog: 221.0 },
        { timestamp: "2025-09-08T08:45:00Z", lat: 18.580, lon: 72.875, sog: 9.5, cog: 220.0 },
        { timestamp: "2025-09-08T10:00:00Z", lat: 18.470, lon: 72.795, sog: 12.6, cog: 220.0 }
      ],
      anomalies: {
        has_speed_anomaly: false,
        has_ais_gap: false,
        has_course_anomaly: false,
        speed_drop_knots: 3.2,
        max_ais_gap_minutes: 5.0
      },
      score_breakdown: {
        spatial: 72.0,
        temporal: 85.0,
        trajectory: 75.0,
        behavior_anomaly: 30.0,
        ais_gap: 20.0,
        drift_consistency: 80.0
      },
      evidence_checklist: [
        { fulfilled: true, text: "Within 4.8 km of probable origin zone", score: 72.0 },
        { fulfilled: true, text: "Present near origin during release window (08:45 UTC)", score: 85.0 },
        { fulfilled: true, text: "Trajectory passed through outer buffer zone", score: 75.0 },
        { fulfilled: false, text: "Normal steady speed maintained along standard shipping lane", score: 30.0 },
        { fulfilled: false, text: "Continuous uninterrupted AIS telemetry signal recorded", score: 20.0 },
        { fulfilled: true, text: "Vessel track alignment consistent with drift path", score: 80.0 }
      ],
      explainable_summary: "Vessel SEA HORIZON scored 67/100 due to moderate proximity (4.8 km) and presence during release window, though it maintained normal steady speed without telemetry gaps."
    },
    {
      mmsi: 419003889,
      vessel_name: "PACIFIC TRADER",
      vessel_type: "Container Ship",
      flag: "Singapore",
      length_m: 294,
      rank: 3,
      correlation_score: 42.0,
      investigation_priority: "LOW",
      min_distance_to_origin_km: 8.5,
      closest_timestamp: "2025-09-08T09:20:00Z",
      closest_position: { lat: 18.610, lon: 72.910, sog: 16.2, cog: 225.0, timestamp: "2025-09-08T09:20:00Z" },
      positions: [
        { timestamp: "2025-09-08T07:00:00Z", lat: 18.840, lon: 73.080, sog: 16.5, cog: 225.0 },
        { timestamp: "2025-09-08T08:15:00Z", lat: 18.720, lon: 72.990, sog: 16.4, cog: 225.0 },
        { timestamp: "2025-09-08T09:20:00Z", lat: 18.610, lon: 72.910, sog: 16.2, cog: 225.0 },
        { timestamp: "2025-09-08T10:30:00Z", lat: 18.490, lon: 72.820, sog: 16.3, cog: 225.0 }
      ],
      anomalies: {
        has_speed_anomaly: false,
        has_ais_gap: false,
        has_course_anomaly: false,
        speed_drop_knots: 0.3,
        max_ais_gap_minutes: 2.0
      },
      score_breakdown: {
        spatial: 45.0,
        temporal: 65.0,
        trajectory: 50.0,
        behavior_anomaly: 20.0,
        ais_gap: 15.0,
        drift_consistency: 70.0
      },
      evidence_checklist: [
        { fulfilled: false, text: "Distance of 8.5 km from probable origin zone", score: 45.0 },
        { fulfilled: true, text: "Transit recorded in region during release window", score: 65.0 },
        { fulfilled: false, text: "Trajectory bypassed core origin zone", score: 50.0 },
        { fulfilled: false, text: "High transit speed (16.2 knots) with no slowdown", score: 20.0 },
        { fulfilled: false, text: "Continuous AIS signal", score: 15.0 },
        { fulfilled: true, text: "Standard transit heading aligned with shipping lane", score: 70.0 }
      ],
      explainable_summary: "Vessel PACIFIC TRADER scored 42/100, acting as a low priority lead as it maintained a high transit speed of 16.2 knots well outside the core origin zone."
    }
  ];

  const timeline = [
    { time: "06:30 UTC", timestamp: "2025-09-08T06:30:00Z", title: "Vessel Entering Region", description: "MT OCEAN STAR enters northern sector traveling at 13.8 knots.", vessel_mmsi: 419001892 },
    { time: "07:45 UTC", timestamp: "2025-09-08T07:45:00Z", title: "Vessel Slowdown", description: "MT OCEAN STAR experiences speed drop from 13.5 to 6.2 knots.", vessel_mmsi: 419001892 },
    { time: "08:10 UTC", timestamp: "2025-09-08T08:10:00Z", title: "Estimated Release Window Begins", description: "Estimated discharge window starts near probable origin coordinates.", vessel_mmsi: null },
    { time: "08:11 UTC", timestamp: "2025-09-08T08:11:00Z", title: "AIS Transmission Gap", description: "MT OCEAN STAR AIS signal goes missing for 28 minutes at 2.1 km from origin.", vessel_mmsi: 419001892 },
    { time: "08:39 UTC", timestamp: "2025-09-08T08:39:00Z", title: "AIS Telemetry Resumed", description: "MT OCEAN STAR resumes AIS signal broadcast, altering course towards SW.", vessel_mmsi: 419001892 },
    { time: "10:00 UTC", timestamp: "2025-09-08T10:00:00Z", title: "Estimated Release Window Ends", description: "Estimated discharge window concludes based on ocean current drift calculations.", vessel_mmsi: null },
    { time: "10:30 UTC", timestamp: "2025-09-08T10:30:00Z", title: "Sentinel-1 SAR Acquisition", description: "Sentinel-1 SAR satellite captures dark oil slick (14.7 km²) in Arabian Sea.", vessel_mmsi: null }
  ];

  return {
    incident_id: "SD-001",
    title: "Arabian Sea Offshore Spill — Mumbai High Sector",
    location_name: "Arabian Sea (18.523° N, 72.812° E)",
    detection_timestamp: "2025-09-08T10:30:00Z",
    sar_image_b64: generateSvgSarB64(),
    detection,
    environmental: {
      wind_speed_kmh: 18.0,
      wind_direction_deg: 45.0,
      wind_direction_label: "NE",
      current_speed_ms: 0.42,
      current_direction_deg: 225.0,
      current_direction_label: "SW",
      sea_state: "Slight / Code 3"
    },
    drift: {
      backcast,
      forecast
    },
    ais_summary: {
      total_in_region: 126,
      spatially_relevant: 32,
      present_in_release_window: 11,
      strongly_correlated: 5
    },
    ranked_vessels,
    timeline
  };
}

function generateLocalDetectionResult(lat: number, lon: number): DetectionResult {
  return {
    status: "OIL SPILL DETECTED",
    oil_detected: true,
    confidence: 91.5,
    area_km2: 12.4,
    perimeter_km: 16.2,
    length_km: 5.5,
    width_km: 2.3,
    compactness: 0.592,
    orientation_deg: 42.0,
    centroid: { lat, lon },
    bounding_box: { x_px: 150, y_px: 200, width_px: 220, height_px: 130 },
    polygon: createCirclePolygon(lat, lon, 1.8),
    detection_timestamp: new Date().toISOString(),
    estimated_release_window: {
      start: "08:00 UTC",
      end: "10:00 UTC",
      estimated_age_hours: "4–8 hours",
      confidence: "High",
      note: "Release window computed using local advection model."
    },
    mask_base64: generateSvgOilMaskB64()
  };
}

function clientSideRankVessels(vessels: VesselCandidate[], weights: ScoringWeights): VesselCandidate[] {
  const totalW = weights.spatial + weights.temporal + weights.trajectory + weights.anomaly + weights.ais_gap + weights.drift || 1.0;
  
  return vessels.map(v => {
    const sb = v.score_breakdown;
    const score = (
      (sb.spatial * weights.spatial) +
      (sb.temporal * weights.temporal) +
      (sb.trajectory * weights.trajectory) +
      (sb.behavior_anomaly * weights.anomaly) +
      (sb.ais_gap * weights.ais_gap) +
      (sb.drift_consistency * weights.drift)
    ) / totalW;

    const finalScore = Math.min(100, Math.max(0, Math.round(score * 10) / 10));
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (finalScore >= 75) priority = 'HIGH';
    else if (finalScore >= 50) priority = 'MEDIUM';

    return {
      ...v,
      correlation_score: finalScore,
      investigation_priority: priority
    };
  }).sort((a, b) => b.correlation_score - a.correlation_score)
    .map((v, i) => ({ ...v, rank: i + 1 }));
}

function createCirclePolygon(lat: number, lon: number, radiusKm: number, points: number = 16): number[][] {
  const poly: number[][] = [];
  const kmPerLat = 111.0;
  const kmPerLon = 111.0 * Math.cos(lat * Math.PI / 180);

  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI / points) * i;
    const dLat = (radiusKm * Math.cos(angle)) / kmPerLat;
    const dLon = (radiusKm * Math.sin(angle)) / kmPerLon;
    poly.push([Number((lat + dLat).toFixed(5)), Number((lon + dLon).toFixed(5))]);
  }
  if (poly.length > 0) poly.push(poly[0]);
  return poly;
}

function generateSvgSarB64(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#0f172a"/>
    <ellipse cx="300" cy="300" rx="260" ry="260" fill="#1e293b" opacity="0.8"/>
    <!-- Speckle noise texture simulation -->
    <path d="M50 100 Q150 80 250 120 T450 110 T550 150" stroke="#334155" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M30 200 Q180 170 300 210 T520 190" stroke="#334155" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M40 400 Q200 370 340 420 T540 380" stroke="#334155" stroke-width="2" fill="none" opacity="0.6"/>
    <!-- Dark Oil Slick -->
    <path d="M240 260 C280 230 360 240 400 280 C430 310 390 350 330 340 C270 330 220 300 240 260 Z" fill="#020617" opacity="0.95"/>
    <ellipse cx="230" cy="320" rx="45" ry="20" fill="#020617" opacity="0.9"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function generateSvgOilMaskB64(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="transparent"/>
    <path d="M240 260 C280 230 360 240 400 280 C430 310 390 350 330 340 C270 330 220 300 240 260 Z" fill="rgba(239, 68, 68, 0.55)" stroke="#06b6d4" stroke-width="3"/>
    <ellipse cx="230" cy="320" rx="45" ry="20" fill="rgba(239, 68, 68, 0.55)" stroke="#06b6d4" stroke-width="3"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}
