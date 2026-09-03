from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import Response, PlainTextResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import io

from app.ml.detector import OilSpillDetector
from app.drift.drift_model import OceanDriftModel
from app.ais.ais_parser import AISParser
from app.ais.anomaly_detector import AISAnomalyDetector
from app.correlation.correlation_engine import VesselCorrelationEngine
from app.data.demo_scenario import get_demo_incident_data
from app.data.sample_sar_generator import generate_synthetic_sar_image
from app.report.pdf_generator import generate_pdf_report, generate_csv_report

router = APIRouter()

detector = OilSpillDetector()
drift_model = OceanDriftModel()
ais_parser = AISParser()
anomaly_detector = AISAnomalyDetector()

# Pydantic Schemas
class DriftRequest(BaseModel):
    spill_lat: float = 18.523
    spill_lon: float = 72.812
    wind_speed_kmh: float = 18.0
    wind_dir_deg: float = 45.0
    current_speed_ms: float = 0.42
    current_dir_deg: float = 225.0
    hours_back: float = 2.5

class RankingWeightsRequest(BaseModel):
    spatial: float = 0.25
    temporal: float = 0.25
    trajectory: float = 0.20
    anomaly: float = 0.10
    ais_gap: float = 0.10
    drift: float = 0.10

class CustomRankingRequest(BaseModel):
    vessels: List[Dict[str, Any]]
    origin_lat: float = 18.558
    origin_lon: float = 72.846
    origin_radius_km: float = 2.5
    weights: Optional[RankingWeightsRequest] = None

@router.get("/health")
def get_system_health():
    return {
        "status": "ONLINE",
        "system": "SAGAR DRISHTI",
        "timestamp_utc": "2026-09-03T18:35:00Z",
        "modules": {
            "satellite_detection_module": {"status": "Operational", "engine": "OpenCV / SAR Segmentation Pipeline"},
            "ais_engine": {"status": "Operational", "engine": "Normalizer & Anomaly Detector"},
            "drift_engine": {"status": "Operational", "engine": "Physics Advection Hindcast & Forecast"},
            "correlation_engine": {"status": "Operational", "engine": "Explainable Multi-Factor Scoring"},
            "database": {"status": "Operational", "storage": "InMemory / Session Store"}
        }
    }

@router.get("/demo")
def get_demo_scenario():
    """Returns complete end-to-end SD-001 Demo Incident scenario."""
    demo_raw = get_demo_incident_data()
    
    center_lat = demo_raw["centroid"]["lat"]
    center_lon = demo_raw["centroid"]["lon"]
    
    # 1. Run detection
    img_bytes, _ = generate_synthetic_sar_image()
    detection = detector.process_image_bytes(img_bytes, center_lat, center_lon)

    # 2. Run drift backcast & forecast
    env = demo_raw["environmental"]
    backcast = drift_model.backcast_origin(
        spill_lat=center_lat,
        spill_lon=center_lon,
        wind_speed_kmh=env["wind_speed_kmh"],
        wind_dir_deg=env["wind_direction_deg"],
        current_speed_ms=env["current_speed_ms"],
        current_dir_deg=env["current_direction_deg"],
        hours_back=2.5
    )

    forecast = drift_model.forecast_drift(
        spill_lat=center_lat,
        spill_lon=center_lon,
        wind_speed_kmh=env["wind_speed_kmh"],
        wind_dir_deg=env["wind_direction_deg"],
        current_speed_ms=env["current_speed_ms"],
        current_dir_deg=env["current_direction_deg"]
    )

    # 3. Process candidate vessels & run correlation ranking
    vessels_list = demo_raw["vessels"]
    
    # Run anomaly detector on each vessel track
    origin_info = backcast["probable_origin"]
    for v in vessels_list:
        v["anomalies"] = anomaly_detector.analyze_vessel_behavior(
            v, origin_info["lat"], origin_info["lon"]
        )

    correlation_engine = VesselCorrelationEngine()
    ranked_vessels = correlation_engine.rank_vessels(
        vessels=vessels_list,
        origin_lat=origin_info["lat"],
        origin_lon=origin_info["lon"],
        origin_radius_km=origin_info["uncertainty_radius_km"],
        drift_direction_deg=backcast["drift_direction_deg"]
    )

    return {
        "incident_id": demo_raw["incident_id"],
        "title": demo_raw["title"],
        "location_name": demo_raw["location_name"],
        "detection_timestamp": demo_raw["detection_timestamp"],
        "sar_image_b64": demo_raw["sar_image_b64"],
        "detection": detection,
        "environmental": env,
        "drift": {
            "backcast": backcast,
            "forecast": forecast
        },
        "ais_summary": demo_raw["ais_stats"],
        "ranked_vessels": ranked_vessels,
        "timeline": demo_raw["timeline"]
    }

@router.post("/detect-spill")
async def detect_spill(
    file: Optional[UploadFile] = File(None),
    center_lat: float = Form(18.523),
    center_lon: float = Form(72.812)
):
    if file:
        content = await file.read()
        try:
            res = detector.process_image_bytes(content, center_lat, center_lon)
            return res
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")
    
    # Fallback synthetic detection
    img_bytes, _ = generate_synthetic_sar_image()
    return detector.process_image_bytes(img_bytes, center_lat, center_lon)

@router.post("/drift/backcast")
def run_backcast(req: DriftRequest):
    return drift_model.backcast_origin(
        spill_lat=req.spill_lat,
        spill_lon=req.spill_lon,
        wind_speed_kmh=req.wind_speed_kmh,
        wind_dir_deg=req.wind_dir_deg,
        current_speed_ms=req.current_speed_ms,
        current_dir_deg=req.current_dir_deg,
        hours_back=req.hours_back
    )

@router.post("/drift/forecast")
def run_forecast(req: DriftRequest):
    return drift_model.forecast_drift(
        spill_lat=req.spill_lat,
        spill_lon=req.spill_lon,
        wind_speed_kmh=req.wind_speed_kmh,
        wind_dir_deg=req.wind_dir_deg,
        current_speed_ms=req.current_speed_ms,
        current_dir_deg=req.current_dir_deg
    )

@router.post("/ais/upload")
async def upload_ais_csv(
    file: UploadFile = File(...),
    origin_lat: float = Form(18.558),
    origin_lon: float = Form(72.846)
):
    content = await file.read()
    try:
        raw_records = ais_parser.parse_csv(content)
        vessel_tracks = ais_parser.extract_vessel_tracks(raw_records)
        filtered_vessels = ais_parser.filter_vessels_near_origin(
            vessel_tracks, origin_lat, origin_lon, spatial_threshold_km=25.0
        )
        return {
            "total_records": len(raw_records),
            "total_vessels": len(vessel_tracks),
            "filtered_vessels_count": len(filtered_vessels),
            "vessels": list(filtered_vessels.values())
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/vessels/rank")
def rank_vessels_endpoint(req: CustomRankingRequest):
    weights_dict = None
    if req.weights:
        weights_dict = {
            "spatial": req.weights.spatial,
            "temporal": req.weights.temporal,
            "trajectory": req.weights.trajectory,
            "anomaly": req.weights.anomaly,
            "ais_gap": req.weights.ais_gap,
            "drift": req.weights.drift
        }
    
    engine = VesselCorrelationEngine(weights_dict)
    
    # Ensure anomalies calculated
    for v in req.vessels:
        if "anomalies" not in v or not v["anomalies"]:
            v["anomalies"] = anomaly_detector.analyze_vessel_behavior(
                v, req.origin_lat, req.origin_lon
            )

    ranked = engine.rank_vessels(
        vessels=req.vessels,
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        origin_radius_km=req.origin_radius_km
    )
    return {"ranked_vessels": ranked}

@router.get("/sample-ais-csv")
def get_sample_ais_csv():
    sample_csv = """MMSI,VesselName,VesselType,Timestamp,Latitude,Longitude,SpeedOverGround,CourseOverGround
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T06:30:00Z,18.720,72.960,13.8,215.0
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T07:15:00Z,18.640,72.900,13.5,212.0
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T07:45:00Z,18.590,72.865,6.2,210.0
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T08:11:00Z,18.558,72.842,2.1,208.0
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T08:39:00Z,18.535,72.825,3.4,205.0
419001892,MT OCEAN STAR,Oil Tanker,2025-09-08T09:05:00Z,18.490,72.780,12.0,240.0
419002341,SEA HORIZON,Bulk Carrier,2025-09-08T06:30:00Z,18.780,73.010,12.8,222.0
419002341,SEA HORIZON,Bulk Carrier,2025-09-08T07:30:00Z,18.670,72.940,12.4,221.0
419002341,SEA HORIZON,Bulk Carrier,2025-09-08T08:45:00Z,18.580,72.875,9.5,220.0
419003889,PACIFIC TRADER,Container Ship,2025-09-08T07:00:00Z,18.840,73.080,16.5,225.0
419003889,PACIFIC TRADER,Container Ship,2025-09-08T08:15:00Z,18.720,72.990,16.4,225.0
419003889,PACIFIC TRADER,Container Ship,2025-09-08T09:20:00Z,18.610,72.910,16.2,225.0
"""
    return Response(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sagar_drishti_sample_ais.csv"}
    )

@router.get("/report/pdf")
def download_pdf_report():
    """Generates and serves a downloadable PDF investigation report."""
    demo_incident = get_demo_scenario()
    pdf_bytes = generate_pdf_report(demo_incident)
    
    # Validate PDF signature and bytes integrity
    if not pdf_bytes or not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=500,
            detail="PDF generation failed: invalid PDF signature"
        )
        
    inc_id = demo_incident.get("incident_id", "SD-001")
    filename = f"Sagar_Drishti_Investigation_Report_{inc_id}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.get("/report/csv")
def download_csv_report():
    """Generates and serves downloadable CSV vessel evidence leads."""
    demo_incident = get_demo_scenario()
    csv_str = generate_csv_report(demo_incident)
    
    inc_id = demo_incident.get("incident_id", "SD-001")
    filename = f"Sagar_Drishti_Evidence_{inc_id}.csv"
    
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

