export interface Centroid {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  x_px: number;
  y_px: number;
  width_px: number;
  height_px: number;
}

export interface ReleaseWindow {
  start: string;
  end: string;
  estimated_age_hours: string;
  confidence: string;
  note: string;
}

export interface DetectionResult {
  status: string;
  oil_detected: boolean;
  confidence: number;
  area_km2: number;
  perimeter_km: number;
  length_km: number;
  width_km: number;
  compactness: number;
  orientation_deg: number;
  centroid: Centroid;
  bounding_box: BoundingBox;
  polygon: number[][]; // [[lat, lon], ...]
  detection_timestamp: string;
  estimated_release_window: ReleaseWindow;
  mask_base64: string;
}

export interface EnvironmentalData {
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_label: string;
  current_speed_ms: number;
  current_direction_deg: number;
  current_direction_label: string;
  sea_state: string;
}

export interface TrajectoryPoint {
  step: number;
  hours_ago: number;
  lat: number;
  lon: number;
  uncertainty_radius_km: number;
}

export interface OriginZone {
  lat: number;
  lon: number;
  uncertainty_radius_km: number;
  estimated_release_window: string;
  polygon: number[][];
}

export interface ForecastPoint {
  hours_ahead: number;
  predicted_lat: number;
  predicted_lon: number;
  uncertainty_radius_km: number;
  polygon: number[][];
  confidence: string;
}

export interface DriftData {
  drift_speed_kmh: number;
  drift_direction_deg: number;
  reverse_bearing_deg: number;
  hindcast_hours: number;
  backtrack_trajectory: TrajectoryPoint[];
  probable_origin: OriginZone;
  forecast?: ForecastPoint[];
}

export interface VesselPosition {
  timestamp: string;
  lat: number;
  lon: number;
  sog: number; // speed over ground in knots
  cog: number; // course over ground in degrees
}

export interface VesselAnomaly {
  has_speed_anomaly: boolean;
  has_ais_gap: boolean;
  has_course_anomaly: boolean;
  speed_drop_knots: number;
  max_ais_gap_minutes: number;
  anomalies_summary?: { type: string; severity: string; description: string }[];
}

export interface ScoreBreakdown {
  spatial: number;
  temporal: number;
  trajectory: number;
  behavior_anomaly: number;
  ais_gap: number;
  drift_consistency: number;
}

export interface EvidenceItem {
  fulfilled: boolean;
  text: string;
  score: number;
}

export interface VesselCandidate {
  mmsi: number;
  vessel_name: string;
  vessel_type: string;
  flag?: string;
  length_m?: number;
  rank?: number;
  correlation_score: number;
  investigation_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  min_distance_to_origin_km: number;
  closest_timestamp: string;
  closest_position: VesselPosition;
  positions: VesselPosition[];
  anomalies?: VesselAnomaly;
  score_breakdown: ScoreBreakdown;
  evidence_checklist: EvidenceItem[];
  explainable_summary: string;
}

export interface TimelineEvent {
  time: string;
  timestamp: string;
  title: string;
  description: string;
  vessel_mmsi?: number | null;
}

export interface ScoringWeights {
  spatial: number;
  temporal: number;
  trajectory: number;
  anomaly: number;
  ais_gap: number;
  drift: number;
}

export interface IncidentData {
  incident_id: string;
  title: string;
  location_name: string;
  detection_timestamp: string;
  sar_image_b64: string;
  detection: DetectionResult;
  environmental: EnvironmentalData;
  drift: {
    backcast: DriftData;
    forecast: ForecastPoint[];
  };
  ais_summary: {
    total_in_region: number;
    spatially_relevant: number;
    present_in_release_window: number;
    strongly_correlated: number;
  };
  ranked_vessels: VesselCandidate[];
  timeline: TimelineEvent[];
}
