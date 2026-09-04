from typing import Dict, Any
from app.data.sample_sar_generator import generate_synthetic_sar_image

def get_demo_incident_data(scene_id: str = "SD-SAR-001") -> Dict[str, Any]:
    """
    Returns complete pre-configured realistic demonstration scenario data for
    SD-SAR-001 (Mumbai High), SD-SAR-002 (Goa Sector), or SD-SAR-003 (Gujarat Sector).
    """
    _, sar_b64 = generate_synthetic_sar_image()

    if scene_id == "SD-SAR-002":
        center_lat = 15.400
        center_lon = 73.550
        return {
            "incident_id": "SD-SAR-002",
            "title": "Arabian Sea Offshore Spill — Goa Coastal Sector",
            "location_name": "Arabian Sea (15.400° N, 73.550° E)",
            "detection_timestamp": "2025-09-08T11:15:00Z",
            "spill_area_km2": 9.3,
            "centroid": {"lat": center_lat, "lon": center_lon},
            "environmental": {
                "wind_speed_kmh": 14.0,
                "wind_direction_deg": 315.0,  # NW
                "wind_direction_label": "NW",
                "current_speed_ms": 0.35,
                "current_direction_deg": 135.0,  # SE
                "current_direction_label": "SE",
                "sea_state": "Smooth-Moderate / Code 2"
            },
            "ais_stats": {
                "total_in_region": 84,
                "spatially_relevant": 21,
                "present_in_release_window": 8,
                "strongly_correlated": 4
            },
            "dark_vessel_stats": {
                "sar_echoes_detected": 5,
                "ais_matched_echoes": 4,
                "unmatched_sar_echoes": 1,
                "dark_vessel_candidates": [
                    {
                        "contact_id": "SAR-DARK-003",
                        "lat": 15.385,
                        "lon": 73.520,
                        "estimated_length_m": 160,
                        "radar_rcs_db": 34.2,
                        "status": "Potential AIS-Dark Vessel / Unmatched SAR Contact",
                        "note": "Requires further investigation — No matching AIS transmission within 15 km."
                    }
                ]
            },
            "look_alike": {
                "verdict": "Potential Genuine Spill",
                "confidence": "High (88.5%)",
                "checks": [
                    {"name": "SAR Pattern", "passed": True, "detail": "Low radar backscatter dampening (-24.1 dB)"},
                    {"name": "Wind Consistency", "passed": True, "detail": "14.0 km/h wind within 6–30 km/h oil stability range"},
                    {"name": "Shape Consistency", "passed": True, "detail": "High edge gradient with elongated slick body"},
                    {"name": "Environmental", "passed": True, "detail": "No natural biogenic slick anomaly detected"}
                ]
            },
            "vessels": [
                {
                    "mmsi": 419008712,
                    "vessel_name": "MT GOA TRADER",
                    "vessel_type": "Chemical Tanker",
                    "flag": "India",
                    "length_m": 185,
                    "min_distance_to_origin_km": 1.5,
                    "closest_position": {"lat": 15.365, "lon": 73.510, "timestamp": "2025-09-08T09:25:00Z", "sog": 3.1, "cog": 140.0},
                    "anomalies": {
                        "has_speed_anomaly": True,
                        "has_ais_gap": True,
                        "has_course_anomaly": True,
                        "speed_drop_knots": 9.2,
                        "max_ais_gap_minutes": 22.0
                    },
                    "positions": [
                        {"timestamp": "2025-09-08T07:30:00Z", "lat": 15.480, "lon": 73.620, "sog": 12.3, "cog": 145.0},
                        {"timestamp": "2025-09-08T08:45:00Z", "lat": 15.410, "lon": 73.550, "sog": 5.8, "cog": 142.0},
                        {"timestamp": "2025-09-08T09:20:00Z", "lat": 15.365, "lon": 73.510, "sog": 3.1, "cog": 140.0},
                        {"timestamp": "2025-09-08T10:15:00Z", "lat": 15.310, "lon": 73.460, "sog": 11.8, "cog": 140.0}
                    ]
                },
                {
                    "mmsi": 419007421,
                    "vessel_name": "MALABAR STAR",
                    "vessel_type": "Container Ship",
                    "flag": "Singapore",
                    "length_m": 220,
                    "min_distance_to_origin_km": 5.2,
                    "closest_position": {"lat": 15.390, "lon": 73.530, "timestamp": "2025-09-08T09:50:00Z", "sog": 10.2, "cog": 150.0},
                    "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 2.1, "max_ais_gap_minutes": 4.0},
                    "positions": [
                        {"timestamp": "2025-09-08T08:00:00Z", "lat": 15.520, "lon": 73.650, "sog": 12.5, "cog": 150.0},
                        {"timestamp": "2025-09-08T09:50:00Z", "lat": 15.390, "lon": 73.530, "sog": 10.2, "cog": 150.0},
                        {"timestamp": "2025-09-08T11:15:00Z", "lat": 15.280, "lon": 73.420, "sog": 12.4, "cog": 150.0}
                    ]
                }
            ],
            "timeline": [
                {"time": "08:00 UTC", "timestamp": "2025-09-08T08:00:00Z", "title": "Vessel Entering Sector", "description": "MT GOA TRADER enters Goa offshore corridor at 12.3 knots.", "vessel_mmsi": 419008712},
                {"time": "09:20 UTC", "timestamp": "2025-09-08T09:20:00Z", "title": "Telemetry Gap & Slowdown", "description": "MT GOA TRADER experiences 22-minute AIS gap while slowing to 3.1 knots.", "vessel_mmsi": 419008712},
                {"time": "11:15 UTC", "timestamp": "2025-09-08T11:15:00Z", "title": "Sentinel-1A SAR Acquisition", "description": "Sentinel-1A captures 9.3 km² dark slick off Goa coast.", "vessel_mmsi": None}
            ],
            "sar_image_b64": sar_b64
        }

    elif scene_id == "SD-SAR-003":
        center_lat = 20.300
        center_lon = 72.200
        return {
            "incident_id": "SD-SAR-003",
            "title": "Gulf of Khambhat / Gujarat Offshore Sector Spill",
            "location_name": "Gulf of Khambhat (20.300° N, 72.200° E)",
            "detection_timestamp": "2025-09-08T12:00:00Z",
            "spill_area_km2": 22.1,
            "centroid": {"lat": center_lat, "lon": center_lon},
            "environmental": {
                "wind_speed_kmh": 22.0,
                "wind_direction_deg": 270.0,  # W
                "wind_direction_label": "W",
                "current_speed_ms": 0.55,
                "current_direction_deg": 90.0,  # E
                "current_direction_label": "E",
                "sea_state": "Moderate / Code 4"
            },
            "ais_stats": {
                "total_in_region": 142,
                "spatially_relevant": 45,
                "present_in_release_window": 16,
                "strongly_correlated": 6
            },
            "dark_vessel_stats": {
                "sar_echoes_detected": 9,
                "ais_matched_echoes": 6,
                "unmatched_sar_echoes": 3,
                "dark_vessel_candidates": [
                    {
                        "contact_id": "SAR-DARK-004",
                        "lat": 20.260,
                        "lon": 72.150,
                        "estimated_length_m": 210,
                        "radar_rcs_db": 39.5,
                        "status": "Potential AIS-Dark Vessel / Unmatched SAR Contact",
                        "note": "Unmatched radar echo near probable origin zone."
                    },
                    {
                        "contact_id": "SAR-DARK-005",
                        "lat": 20.320,
                        "lon": 72.240,
                        "estimated_length_m": 145,
                        "radar_rcs_db": 31.8,
                        "status": "Potential AIS-Dark Vessel / Unmatched SAR Contact",
                        "note": "No AIS telemetry detected during SAR pass."
                    }
                ]
            },
            "look_alike": {
                "verdict": "Potential Genuine Spill",
                "confidence": "High (96.1%)",
                "checks": [
                    {"name": "SAR Pattern", "passed": True, "detail": "Severe backscatter attenuation (-27.4 dB)"},
                    {"name": "Wind Consistency", "passed": True, "detail": "22.0 km/h ocean wind ideal for slick persistence"},
                    {"name": "Shape Consistency", "passed": True, "detail": "High-contrast irregular slick boundary"},
                    {"name": "Environmental", "passed": True, "detail": "Chlorophyll index normal, rules out algal bloom"}
                ]
            },
            "vessels": [
                {
                    "mmsi": 419009543,
                    "vessel_name": "MT GUJARAT PRIDE",
                    "vessel_type": "Crude Oil Tanker",
                    "flag": "India",
                    "length_m": 274,
                    "min_distance_to_origin_km": 1.1,
                    "closest_position": {"lat": 20.280, "lon": 72.115, "timestamp": "2025-09-08T10:15:00Z", "sog": 1.8, "cog": 88.0},
                    "anomalies": {
                        "has_speed_anomaly": True,
                        "has_ais_gap": True,
                        "has_course_anomaly": True,
                        "speed_drop_knots": 13.5,
                        "max_ais_gap_minutes": 35.0
                    },
                    "positions": [
                        {"timestamp": "2025-09-08T08:00:00Z", "lat": 20.250, "lon": 71.920, "sog": 15.3, "cog": 90.0},
                        {"timestamp": "2025-09-08T09:30:00Z", "lat": 20.270, "lon": 72.040, "sog": 6.1, "cog": 89.0},
                        {"timestamp": "2025-09-08T10:15:00Z", "lat": 20.280, "lon": 72.115, "sog": 1.8, "cog": 88.0},
                        {"timestamp": "2025-09-08T11:45:00Z", "lat": 20.310, "lon": 72.280, "sog": 14.2, "cog": 92.0}
                    ]
                },
                {
                    "mmsi": 419006124,
                    "vessel_name": "KHAMBHAT EXPRESS",
                    "vessel_type": "LNG Carrier",
                    "flag": "Bahamas",
                    "length_m": 290,
                    "min_distance_to_origin_km": 4.1,
                    "closest_position": {"lat": 20.310, "lon": 72.140, "timestamp": "2025-09-08T10:45:00Z", "sog": 11.2, "cog": 95.0},
                    "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 2.0, "max_ais_gap_minutes": 5.0},
                    "positions": [
                        {"timestamp": "2025-09-08T08:30:00Z", "lat": 20.270, "lon": 71.950, "sog": 13.2, "cog": 95.0},
                        {"timestamp": "2025-09-08T10:45:00Z", "lat": 20.310, "lon": 72.140, "sog": 11.2, "cog": 95.0},
                        {"timestamp": "2025-09-08T12:00:00Z", "lat": 20.340, "lon": 72.260, "sog": 13.1, "cog": 95.0}
                    ]
                }
            ],
            "timeline": [
                {"time": "08:00 UTC", "timestamp": "2025-09-08T08:00:00Z", "title": "Tanker Transit", "description": "MT GUJARAT PRIDE enters Gulf of Khambhat shipping lane at 15.3 knots.", "vessel_mmsi": 419009543},
                {"time": "10:15 UTC", "timestamp": "2025-09-08T10:15:00Z", "title": "Severe Speed Drop & AIS Gap", "description": "MT GUJARAT PRIDE slows to 1.8 knots with a 35-minute AIS gap near origin.", "vessel_mmsi": 419009543},
                {"time": "12:00 UTC", "timestamp": "2025-09-08T12:00:00Z", "title": "Sentinel-1B SAR Acquisition", "description": "Sentinel-1B captures 22.1 km² slick in Gulf of Khambhat.", "vessel_mmsi": None}
            ],
            "sar_image_b64": sar_b64
        }

    # Default: SD-SAR-001 (Mumbai High Sector)
    center_lat = 18.523
    center_lon = 72.750
    return {
        "incident_id": "SD-SAR-001",
        "title": "Arabian Sea Offshore Spill — Mumbai High Sector",
        "location_name": "Arabian Sea (18.523° N, 72.750° E)",
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
        "dark_vessel_stats": {
            "sar_echoes_detected": 7,
            "ais_matched_echoes": 5,
            "unmatched_sar_echoes": 2,
            "dark_vessel_candidates": [
                {
                    "contact_id": "SAR-DARK-001",
                    "lat": 18.565,
                    "lon": 72.775,
                    "estimated_length_m": 195,
                    "radar_rcs_db": 38.4,
                    "status": "Potential AIS-Dark Vessel / Unmatched SAR Contact",
                    "note": "Radar target detected inside release window with no active AIS signal."
                },
                {
                    "contact_id": "SAR-DARK-002",
                    "lat": 18.510,
                    "lon": 72.710,
                    "estimated_length_m": 130,
                    "radar_rcs_db": 29.1,
                    "status": "Potential AIS-Dark Vessel / Unmatched SAR Contact",
                    "note": "Unmatched SAR echo 8 km SW of spill centroid."
                }
            ]
        },
        "look_alike": {
            "verdict": "Potential Genuine Spill",
            "confidence": "High (94.2%)",
            "checks": [
                {"name": "SAR Pattern", "passed": True, "detail": "Distinct low backscatter slick signature (-26.2 dB)"},
                {"name": "Wind Consistency", "passed": True, "detail": "18.0 km/h wind within optimal 6–30 km/h window"},
                {"name": "Shape Consistency", "passed": True, "detail": "Elongated damping profile, compactness 0.55"},
                {"name": "Environmental", "passed": True, "detail": "Chlorophyll-a normal, no algal bloom false-positive"}
            ]
        },
        "vessels": [
            {
                "mmsi": 419001892,
                "vessel_name": "MT OCEAN STAR",
                "vessel_type": "Oil Tanker",
                "flag": "India",
                "length_m": 245,
                "min_distance_to_origin_km": 1.2,
                "closest_position": {"lat": 18.558, "lon": 72.782, "timestamp": "2025-09-08T08:17:00Z", "sog": 2.1, "cog": 208.0},
                "anomalies": {
                    "has_speed_anomaly": True,
                    "has_ais_gap": True,
                    "has_course_anomaly": True,
                    "speed_drop_knots": 11.4,
                    "max_ais_gap_minutes": 28.0
                },
                "positions": [
                    {"timestamp": "2025-09-08T06:30:00Z", "lat": 18.700, "lon": 72.820, "sog": 13.8, "cog": 215.0},
                    {"timestamp": "2025-09-08T07:15:00Z", "lat": 18.640, "lon": 72.810, "sog": 13.5, "cog": 212.0},
                    {"timestamp": "2025-09-08T07:45:00Z", "lat": 18.590, "lon": 72.795, "sog": 6.2, "cog": 210.0},
                    {"timestamp": "2025-09-08T08:11:00Z", "lat": 18.558, "lon": 72.782, "sog": 2.1, "cog": 208.0},
                    {"timestamp": "2025-09-08T08:39:00Z", "lat": 18.535, "lon": 72.765, "sog": 3.4, "cog": 205.0},
                    {"timestamp": "2025-09-08T09:05:00Z", "lat": 18.490, "lon": 72.730, "sog": 12.0, "cog": 240.0},
                    {"timestamp": "2025-09-08T10:00:00Z", "lat": 18.410, "lon": 72.660, "sog": 13.2, "cog": 238.0}
                ]
            },
            {
                "mmsi": 419002341,
                "vessel_name": "SEA HORIZON",
                "vessel_type": "Bulk Carrier",
                "flag": "Panama",
                "length_m": 190,
                "min_distance_to_origin_km": 4.5,
                "closest_position": {"lat": 18.580, "lon": 72.815, "timestamp": "2025-09-08T08:45:00Z", "sog": 9.5, "cog": 220.0},
                "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 3.2, "max_ais_gap_minutes": 5.0},
                "positions": [
                    {"timestamp": "2025-09-08T06:30:00Z", "lat": 18.750, "lon": 72.830, "sog": 12.8, "cog": 222.0},
                    {"timestamp": "2025-09-08T07:30:00Z", "lat": 18.660, "lon": 72.822, "sog": 12.4, "cog": 221.0},
                    {"timestamp": "2025-09-08T08:45:00Z", "lat": 18.580, "lon": 72.815, "sog": 9.5, "cog": 220.0},
                    {"timestamp": "2025-09-08T10:00:00Z", "lat": 18.470, "lon": 72.750, "sog": 12.6, "cog": 220.0}
                ]
            },
            {
                "mmsi": 419003889,
                "vessel_name": "PACIFIC TRADER",
                "vessel_type": "Container Ship",
                "flag": "Singapore",
                "length_m": 294,
                "min_distance_to_origin_km": 8.2,
                "closest_position": {"lat": 18.610, "lon": 72.825, "timestamp": "2025-09-08T09:20:00Z", "sog": 16.2, "cog": 225.0},
                "anomalies": {"has_speed_anomaly": False, "has_ais_gap": False, "has_course_anomaly": False, "speed_drop_knots": 1.0, "max_ais_gap_minutes": 3.0},
                "positions": [
                    {"timestamp": "2025-09-08T07:00:00Z", "lat": 18.800, "lon": 72.830, "sog": 16.5, "cog": 225.0},
                    {"timestamp": "2025-09-08T08:15:00Z", "lat": 18.700, "lon": 72.828, "sog": 16.4, "cog": 225.0},
                    {"timestamp": "2025-09-08T09:20:00Z", "lat": 18.610, "lon": 72.825, "sog": 16.2, "cog": 225.0},
                    {"timestamp": "2025-09-08T10:30:00Z", "lat": 18.490, "lon": 72.780, "sog": 16.3, "cog": 225.0}
                ]
            }
        ],
        "timeline": [
            {"time": "06:30 UTC", "timestamp": "2025-09-08T06:30:00Z", "title": "Vessel Entering Region", "description": "MT OCEAN STAR enters northern sector traveling at 13.8 knots.", "vessel_mmsi": 419001892},
            {"time": "07:45 UTC", "timestamp": "2025-09-08T07:45:00Z", "title": "Vessel Slowdown", "description": "MT OCEAN STAR experiences speed drop from 13.5 to 6.2 knots.", "vessel_mmsi": 419001892},
            {"time": "08:10 UTC", "timestamp": "2025-09-08T08:10:00Z", "title": "Estimated Release Window Begins", "description": "Estimated discharge window starts near probable origin coordinates.", "vessel_mmsi": None},
            {"time": "08:11 UTC", "timestamp": "2025-09-08T08:11:00Z", "title": "AIS Transmission Gap", "description": "MT OCEAN STAR AIS signal goes missing for 28 minutes at 1.2 km from origin.", "vessel_mmsi": 419001892},
            {"time": "08:39 UTC", "timestamp": "2025-09-08T08:39:00Z", "title": "AIS Telemetry Resumed", "description": "MT OCEAN STAR resumes AIS signal broadcast, altering course towards SW.", "vessel_mmsi": 419001892},
            {"time": "10:00 UTC", "timestamp": "2025-09-08T10:00:00Z", "title": "Estimated Release Window Ends", "description": "Estimated discharge window concludes based on ocean current drift calculations.", "vessel_mmsi": None},
            {"time": "10:30 UTC", "timestamp": "2025-09-08T10:30:00Z", "title": "Sentinel-1 SAR Acquisition", "description": "Sentinel-1 SAR satellite captures dark oil slick (14.7 km²) in Arabian Sea.", "vessel_mmsi": None}
        ],
        "sar_image_b64": sar_b64
    }
