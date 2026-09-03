from typing import Dict, Any
from app.data.sample_sar_generator import generate_synthetic_sar_image

def get_demo_incident_data() -> Dict[str, Any]:
    """
    Returns the complete pre-configured realistic scenario for
    'Demo Incident — Arabian Sea' (Incident SD-001).
    """
    _, sar_b64 = generate_synthetic_sar_image()

    center_lat = 18.523
    center_lon = 72.812

    # Coordinates for candidate vessel tracks around Arabian Sea offshore oil route
    vessels_data = [
        {
            "mmsi": 419001892,
            "vessel_name": "MT OCEAN STAR",
            "vessel_type": "Oil Tanker",
            "flag": "India",
            "length_m": 245,
            "min_distance_to_origin_km": 2.1,
            "closest_position": {"lat": 18.552, "lon": 72.839, "timestamp": "2025-09-08T08:17:00Z", "sog": 2.1, "cog": 210.0},
            "anomalies": {
                "has_speed_anomaly": True,
                "has_ais_gap": True,
                "has_course_anomaly": True,
                "speed_drop_knots": 11.4,
                "max_ais_gap_minutes": 28.0
            },
            "positions": [
                {"timestamp": "2025-09-08T06:30:00Z", "lat": 18.720, "lon": 72.960, "sog": 13.8, "cog": 215.0},
                {"timestamp": "2025-09-08T07:15:00Z", "lat": 18.640, "lon": 72.900, "sog": 13.5, "cog": 212.0},
                {"timestamp": "2025-09-08T07:45:00Z", "lat": 18.590, "lon": 72.865, "sog": 6.2, "cog": 210.0},  # Slowdown
                {"timestamp": "2025-09-08T08:11:00Z", "lat": 18.558, "lon": 72.842, "sog": 2.1, "cog": 208.0},  # Near Origin - GAP STARTS
                {"timestamp": "2025-09-08T08:39:00Z", "lat": 18.535, "lon": 72.825, "sog": 3.4, "cog": 205.0},  # GAP ENDS
                {"timestamp": "2025-09-08T09:05:00Z", "lat": 18.490, "lon": 72.780, "sog": 12.0, "cog": 240.0},  # Course shift
                {"timestamp": "2025-09-08T10:00:00Z", "lat": 18.410, "lon": 72.700, "sog": 13.2, "cog": 238.0}
            ]
        },
        {
            "mmsi": 419002341,
            "vessel_name": "SEA HORIZON",
            "vessel_type": "Bulk Carrier",
            "flag": "Panama",
            "length_m": 190,
            "min_distance_to_origin_km": 4.8,
            "closest_position": {"lat": 18.580, "lon": 72.875, "timestamp": "2025-09-08T08:45:00Z", "sog": 9.5, "cog": 220.0},
            "anomalies": {
                "has_speed_anomaly": False,
                "has_ais_gap": False,
                "has_course_anomaly": False,
                "speed_drop_knots": 3.2,
                "max_ais_gap_minutes": 5.0
            },
            "positions": [
                {"timestamp": "2025-09-08T06:30:00Z", "lat": 18.780, "lon": 73.010, "sog": 12.8, "cog": 222.0},
                {"timestamp": "2025-09-08T07:30:00Z", "lat": 18.670, "lon": 72.940, "sog": 12.4, "cog": 221.0},
                {"timestamp": "2025-09-08T08:45:00Z", "lat": 18.580, "lon": 72.875, "sog": 9.5, "cog": 220.0},
                {"timestamp": "2025-09-08T10:00:00Z", "lat": 18.470, "lon": 72.795, "sog": 12.6, "cog": 220.0}
            ]
        },
        {
            "mmsi": 419003889,
            "vessel_name": "PACIFIC TRADER",
            "vessel_type": "Container Ship",
            "flag": "Singapore",
            "length_m": 294,
            "min_distance_to_origin_km": 8.5,
            "closest_position": {"lat": 18.610, "lon": 72.910, "timestamp": "2025-09-08T09:20:00Z", "sog": 16.2, "cog": 225.0},
            "anomalies": {
                "has_speed_anomaly": False,
                "has_ais_gap": False,
                "has_course_anomaly": False,
                "speed_drop_knots": 1.0,
                "max_ais_gap_minutes": 3.0
            },
            "positions": [
                {"timestamp": "2025-09-08T07:00:00Z", "lat": 18.840, "lon": 73.080, "sog": 16.5, "cog": 225.0},
                {"timestamp": "2025-09-08T08:15:00Z", "lat": 18.720, "lon": 72.990, "sog": 16.4, "cog": 225.0},
                {"timestamp": "2025-09-08T09:20:00Z", "lat": 18.610, "lon": 72.910, "sog": 16.2, "cog": 225.0},
                {"timestamp": "2025-09-08T10:30:00Z", "lat": 18.490, "lon": 72.820, "sog": 16.3, "cog": 225.0}
            ]
        },
        {
            "mmsi": 419004112,
            "vessel_name": "ARABIAN EXPRESS",
            "vessel_type": "Chemical Tanker",
            "flag": "Liberia",
            "length_m": 175,
            "min_distance_to_origin_km": 12.3,
            "closest_position": {"lat": 18.420, "lon": 72.740, "timestamp": "2025-09-08T08:30:00Z", "sog": 13.0, "cog": 045.0},
            "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 0.5, "max_ais_gap_minutes": 2.0},
            "positions": [
                {"timestamp": "2025-09-08T07:00:00Z", "lat": 18.300, "lon": 72.650, "sog": 13.2, "cog": 045.0},
                {"timestamp": "2025-09-08T08:30:00Z", "lat": 18.420, "lon": 72.740, "sog": 13.0, "cog": 045.0},
                {"timestamp": "2025-09-08T10:00:00Z", "lat": 18.540, "lon": 72.830, "sog": 13.1, "cog": 045.0}
            ]
        },
        {
            "mmsi": 419005991,
            "vessel_name": "AL-JABER MARINER",
            "vessel_type": "General Cargo",
            "flag": "UAE",
            "length_m": 140,
            "min_distance_to_origin_km": 17.1,
            "closest_position": {"lat": 18.660, "lon": 72.690, "timestamp": "2025-09-08T09:00:00Z", "sog": 11.5, "cog": 180.0},
            "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 1.2, "max_ais_gap_minutes": 4.0},
            "positions": [
                {"timestamp": "2025-09-08T07:30:00Z", "lat": 18.800, "lon": 72.690, "sog": 11.6, "cog": 180.0},
                {"timestamp": "2025-09-08T09:00:00Z", "lat": 18.660, "lon": 72.690, "sog": 11.5, "cog": 180.0},
                {"timestamp": "2025-09-08T10:30:00Z", "lat": 18.520, "lon": 72.690, "sog": 11.4, "cog": 180.0}
            ]
        }
    ]

    # Timeline events for interactive control
    timeline_events = [
        {"time": "06:30 UTC", "timestamp": "2025-09-08T06:30:00Z", "title": "Vessel Entering Region", "description": "MT OCEAN STAR enters northern sector traveling at 13.8 knots.", "vessel_mmsi": 419001892},
        {"time": "07:45 UTC", "timestamp": "2025-09-08T07:45:00Z", "title": "Vessel Slowdown", "description": "MT OCEAN STAR experiences speed drop from 13.5 to 6.2 knots.", "vessel_mmsi": 419001892},
        {"time": "08:10 UTC", "timestamp": "2025-09-08T08:10:00Z", "title": "Estimated Release Window Begins", "description": "Estimated discharge window starts near probable origin coordinates.", "vessel_mmsi": None},
        {"time": "08:11 UTC", "timestamp": "2025-09-08T08:11:00Z", "title": "AIS Transmission Gap", "description": "MT OCEAN STAR AIS signal goes missing for 28 minutes at 2.1 km from origin.", "vessel_mmsi": 419001892},
        {"time": "08:39 UTC", "timestamp": "2025-09-08T08:39:00Z", "title": "AIS Telemetry Resumed", "description": "MT OCEAN STAR resumes AIS signal broadcast, altering course towards SW.", "vessel_mmsi": 419001892},
        {"time": "10:00 UTC", "timestamp": "2025-09-08T10:00:00Z", "title": "Estimated Release Window Ends", "description": "Estimated discharge window concludes based on ocean current drift calculations.", "vessel_mmsi": None},
        {"time": "10:30 UTC", "timestamp": "2025-09-08T10:30:00Z", "title": "Sentinel-1 SAR Acquisition", "description": "Sentinel-1 SAR satellite captures dark oil slick (14.7 km²) in Arabian Sea.", "vessel_mmsi": None}
    ]

    return {
        "incident_id": "SD-001",
        "title": "Arabian Sea Offshore Spill — Mumbai High Sector",
        "location_name": "Arabian Sea (18.523° N, 72.812° E)",
        "detection_timestamp": "2025-09-08T10:30:00Z",
        "spill_area_km2": 14.7,
        "centroid": {"lat": center_lat, "lon": center_lon},
        "environmental": {
            "wind_speed_kmh": 18.0,
            "wind_direction_deg": 45.0,  # NE
            "wind_direction_label": "NE",
            "current_speed_ms": 0.42,
            "current_direction_deg": 225.0,  # SW
            "current_direction_label": "SW",
            "sea_state": "Slight / Code 3"
        },
        "ais_stats": {
            "total_in_region": 126,
            "spatially_relevant": 32,
            "present_in_release_window": 11,
            "strongly_correlated": 5
        },
        "vessels": vessels_data,
        "timeline": timeline_events,
        "sar_image_b64": sar_b64
    }
