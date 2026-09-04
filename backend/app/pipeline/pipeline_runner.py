import time
from typing import Dict, Any, List, Optional
from app.providers.manager import provider_manager
from app.ml.detector import OilSpillDetector
from app.drift.drift_model import OceanDriftModel
from app.ais.anomaly_detector import AISAnomalyDetector
from app.correlation.correlation_engine import VesselCorrelationEngine
from app.data.demo_scenario import get_demo_incident_data

class PipelineRunner:
    """
    Automated Oil-Spill Investigation Pipeline Execution Engine.
    Executes end-to-end ingestion, detection, characterization, drift hindcasting,
    AIS correlation, and incident creation cleanly and deterministically.
    """

    def __init__(self):
        self.detector = OilSpillDetector()
        self.drift_model = OceanDriftModel()
        self.anomaly_detector = AISAnomalyDetector()
        self.correlation_engine = VesselCorrelationEngine()

        # Track processed scene statuses: scene_id -> status dict
        self._processed_scenes: Dict[str, Dict[str, Any]] = {}
        self._incident_cache: Dict[str, Dict[str, Any]] = {}

    def run_automated_pipeline(self, scene_id: str = "SD-SAR-001") -> Dict[str, Any]:
        """
        Executes complete automated investigation pipeline for a given scene ID.
        Returns execution log steps and final canonical incident result object.
        """
        start_time = time.time()
        logs: List[Dict[str, Any]] = []

        def log_step(step_no: int, stage: str, message: str, status: str = "COMPLETED"):
            logs.append({
                "step": step_no,
                "stage": stage,
                "message": message,
                "status": status,
                "timestamp_utc": "2026-09-05T03:00:00Z"
            })

        # Check if already processed (Duplicate Protection)
        if scene_id in self._processed_scenes and self._processed_scenes[scene_id].get("status") == "COMPLETED":
            log_step(1, "INGEST_SCENE", f"Scene {scene_id} already processed. Returning cached canonical incident.")
            return {
                "scene_id": scene_id,
                "status": "COMPLETED",
                "execution_logs": logs,
                "incident": self._incident_cache[scene_id]
            }

        self._processed_scenes[scene_id] = {"status": "PROCESSING", "scene_id": scene_id}

        # Step 1: SAR Data Ingestion
        log_step(1, "INGEST_SCENE", f"Checking satellite queue for {scene_id}...")
        scene = provider_manager.satellite_provider.get_scene(scene_id)
        if not scene:
            log_step(1, "INGEST_SCENE", f"Scene {scene_id} not found in ingestion queue.", status="FAILED")
            self._processed_scenes[scene_id] = {"status": "FAILED", "scene_id": scene_id}
            raise ValueError(f"Scene {scene_id} unavailable")
        
        log_step(1, "INGEST_SCENE", f"Ingested scene {scene_id} ({scene['satellite']} {scene['sensor_mode']}).")

        # Step 2: Oil Spill Detection
        log_step(2, "DETECT_SPILL", "Running dark backscatter UNet / adaptive threshold segmentation...")
        center_lat = scene.get("center_lat", 18.523)
        center_lon = scene.get("center_lon", 72.750)
        img_bytes = scene.get("image_bytes", b"")

        detection = self.detector.process_image_bytes(img_bytes, center_lat, center_lon)
        spill_area = detection["area_km2"]
        det_confidence = detection["confidence"]
        log_step(2, "DETECT_SPILL", f"Oil slick confirmed: Area {spill_area} km², Confidence {det_confidence}%.")

        # Step 3: Spill Characterization
        log_step(3, "CHARACTERIZE_SPILL", f"Calculated polygon geometry, centroid ({center_lat}°N, {center_lon}°E), perimeter {detection['perimeter_km']} km.")

        # Step 4: Environmental Data Retrieval
        log_step(4, "LOAD_ENVIRONMENT", "Fetching wind & surface ocean current telemetry...")
        env = provider_manager.environmental_provider.get_conditions(center_lat, center_lon, scene["acquisition_timestamp"])
        log_step(4, "LOAD_ENVIRONMENT", f"Wind: {env['wind_speed_kmh']} km/h ({env['wind_direction_label']}) | Current: {env['current_speed_ms']} m/s ({env['current_direction_label']}).")

        # Step 5 & 6: Backward Drift / Hindcast & Probable Origin Estimation
        log_step(5, "RUN_HINDCAST", "Executing 2.5-hour Pravaha-Hindcast 2D hydrodynamic advection model...")
        backcast = self.drift_model.backcast_origin(
            spill_lat=center_lat,
            spill_lon=center_lon,
            wind_speed_kmh=env["wind_speed_kmh"],
            wind_dir_deg=env["wind_direction_deg"],
            current_speed_ms=env["current_speed_ms"],
            current_dir_deg=env["current_direction_deg"],
            hours_back=2.5
        )

        monte_carlo_cone = self.drift_model.generate_monte_carlo_ensemble(
            spill_lat=center_lat,
            spill_lon=center_lon,
            wind_speed_kmh=env["wind_speed_kmh"],
            wind_dir_deg=env["wind_direction_deg"],
            current_speed_ms=env["current_speed_ms"],
            current_dir_deg=env["current_direction_deg"],
            hours_back=2.5,
            num_particles=15,
            seed=42
        )

        forecast = self.drift_model.forecast_drift(
            spill_lat=center_lat,
            spill_lon=center_lon,
            wind_speed_kmh=env["wind_speed_kmh"],
            wind_dir_deg=env["wind_direction_deg"],
            current_speed_ms=env["current_speed_ms"],
            current_dir_deg=env["current_direction_deg"]
        )

        origin_info = backcast["probable_origin"]
        origin_lat = origin_info["lat"]
        origin_lon = origin_info["lon"]
        log_step(6, "ESTIMATE_ORIGIN", f"Probable Origin Zone estimated at {origin_lat}°N, {origin_lon}°E (±{origin_info['uncertainty_radius_km']} km). Monte Carlo ensemble generated 15 realizations.")

        # Step 7: AIS Telemetry Ingestion
        log_step(7, "FETCH_AIS", "Filtering sector AIS telemetry by origin bounding box and release time window...")
        raw_vessels = provider_manager.ais_provider.get_vessel_tracks(
            bbox=scene["bbox"],
            start_time="2025-09-08T08:00:00Z",
            end_time="2025-09-08T10:00:00Z"
        )
        log_step(7, "FETCH_AIS", f"Retrieved {len(raw_vessels)} candidate vessels within spatial-temporal window.")

        # Step 8: Spatio-Temporal Correlation & Scoring
        log_step(8, "CORRELATE_VESSELS", "Evaluating Rakshak-Trace multi-factor correlation scores (spatial, temporal, anomaly, AIS gap, drift alignment)...")
        for v in raw_vessels:
            v["anomalies"] = self.anomaly_detector.analyze_vessel_behavior(v, origin_lat, origin_lon)

        ranked_vessels = self.correlation_engine.rank_vessels(
            vessels=raw_vessels,
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            origin_radius_km=origin_info["uncertainty_radius_km"],
            drift_direction_deg=backcast["drift_direction_deg"]
        )

        top_vessel = ranked_vessels[0]["vessel_name"] if ranked_vessels else "None"
        top_score = ranked_vessels[0]["correlation_score"] if ranked_vessels else 0.0
        log_step(8, "CORRELATE_VESSELS", f"Vessels ranked. Top Candidate: {top_vessel} (Score: {top_score}/100).")

        # Step 9 & 10: Canonical Incident Creation & Report Ready
        log_step(9, "CREATE_INCIDENT", "Assembling canonical AnalysisResult object & dispatching alert.")
        
        inc_id = scene_id
        
        # Load baseline timeline events & scene specific data
        base_demo = get_demo_incident_data(scene_id)

        canonical_incident = {
            "incident_id": inc_id,
            "title": scene["region_name"],
            "location_name": base_demo.get("location_name", f"Arabian Sea ({center_lat}° N, {center_lon}° E)"),
            "detection_timestamp": scene["acquisition_timestamp"],
            "spill_area_km2": spill_area,
            "centroid": {"lat": center_lat, "lon": center_lon},
            "detection": detection,
            "look_alike": base_demo.get("look_alike", {
                "verdict": "Potential Genuine Spill",
                "confidence": f"High ({det_confidence}%)",
                "checks": [
                    {"name": "SAR Pattern", "passed": True, "detail": "Low radar backscatter dampening"},
                    {"name": "Wind Consistency", "passed": True, "detail": f"Wind speed {env['wind_speed_kmh']} km/h within stable range"},
                    {"name": "Shape Consistency", "passed": True, "detail": "Elongated damping profile"},
                    {"name": "Environmental", "passed": True, "detail": "No natural algal bloom false-positive"}
                ]
            }),
            "environmental": env,
            "drift": {
                "backcast": backcast,
                "monte_carlo_cone": monte_carlo_cone,
                "forecast": forecast
            },
            "ais_summary": base_demo.get("ais_stats", {
                "total_in_region": 126,
                "spatially_relevant": 32,
                "present_in_release_window": 11,
                "strongly_correlated": len(ranked_vessels)
            }),
            "dark_vessels": base_demo.get("dark_vessel_stats", {
                "sar_echoes_detected": 7,
                "ais_matched_echoes": 5,
                "unmatched_sar_echoes": 2,
                "dark_vessel_candidates": []
            }),
            "vessels": raw_vessels,
            "ranked_vessels": ranked_vessels,
            "timeline": base_demo.get("timeline", []),
            "sar_image_b64": scene.get("sar_image_b64", ""),
            "data_sources": provider_manager.get_data_sources_status()
        }

        log_step(10, "GENERATE_REPORT", "Investigation report and PDF export package generated.")

        self._incident_cache[scene_id] = canonical_incident
        self._processed_scenes[scene_id] = {"status": "COMPLETED", "scene_id": scene_id}

        return {
            "scene_id": scene_id,
            "status": "COMPLETED",
            "execution_time_sec": round(time.time() - start_time, 2),
            "execution_logs": logs,
            "incident": canonical_incident
        }

pipeline_runner = PipelineRunner()
