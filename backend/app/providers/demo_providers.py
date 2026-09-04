from typing import Dict, Any, List, Optional
from app.providers.base import BaseSatelliteProvider, BaseAISProvider, BaseEnvironmentalProvider
from app.data.sample_sar_generator import generate_synthetic_sar_image

class DemoSatelliteProvider(BaseSatelliteProvider):
    """
    Demonstration SAR Satellite Ingestion Provider.
    Simulates automated SAR scene queue from Sentinel-1 acquisitions.
    """

    def __init__(self):
        self._scenes = {
            "SD-SAR-001": {
                "scene_id": "SD-SAR-001",
                "satellite": "Sentinel-1C",
                "sensor_mode": "IW GRDH",
                "polarization": "VV+VH",
                "acquisition_timestamp": "2025-09-08T10:30:00Z",
                "bbox": {"min_lat": 18.35, "max_lat": 18.75, "min_lon": 72.60, "max_lon": 72.90},
                "region_name": "Arabian Sea — Mumbai High Offshore Sector",
                "center_lat": 18.523,
                "center_lon": 72.750,
                "status": "AVAILABLE",
                "provenance": "Sentinel-1 compatible demonstration scene"
            },
            "SD-SAR-002": {
                "scene_id": "SD-SAR-002",
                "satellite": "Sentinel-1A",
                "sensor_mode": "IW GRDH",
                "polarization": "VV",
                "acquisition_timestamp": "2025-09-08T11:15:00Z",
                "bbox": {"min_lat": 15.20, "max_lat": 15.60, "min_lon": 73.40, "max_lon": 73.70},
                "region_name": "Arabian Sea — Goa Coastal Sector",
                "center_lat": 15.400,
                "center_lon": 73.550,
                "status": "AVAILABLE",
                "provenance": "Sentinel-1 demonstration scene"
            },
            "SD-SAR-003": {
                "scene_id": "SD-SAR-003",
                "satellite": "Sentinel-1B",
                "sensor_mode": "IW GRDH",
                "polarization": "VV+VH",
                "acquisition_timestamp": "2025-09-08T12:00:00Z",
                "bbox": {"min_lat": 20.10, "max_lat": 20.50, "min_lon": 72.00, "max_lon": 72.40},
                "region_name": "Gulf of Khambhat / Gujarat Offshore Sector",
                "center_lat": 20.300,
                "center_lon": 72.200,
                "status": "AVAILABLE",
                "provenance": "Sentinel-1 demonstration scene"
            }
        }

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "source_type": "SAR_SATELLITE",
            "provider_name": "DemoSatelliteProvider",
            "display_status": "DEMO INGESTION",
            "status_code": "DEMO_DATA",
            "is_connected": False,
            "message": "Loaded preselected demonstration SAR scenes queue."
        }

    def list_available_scenes(self) -> List[Dict[str, Any]]:
        return list(self._scenes.values())

    def get_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        scene_meta = self._scenes.get(scene_id)
        if not scene_meta:
            return None
        img_bytes, sar_b64 = generate_synthetic_sar_image()
        res = dict(scene_meta)
        res["image_bytes"] = img_bytes
        res["sar_image_b64"] = sar_b64
        return res


class DemoAISProvider(BaseAISProvider):
    """
    Demonstration AIS Telemetry Provider.
    Simulates vessel track ingestion with deterministic offshore vessel tracks.
    """

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "source_type": "AIS_TELEMETRY",
            "provider_name": "DemoAISProvider",
            "display_status": "DEMO AIS / LIVE PROVIDER NOT CONNECTED",
            "status_code": "DEMO_DATA",
            "is_connected": False,
            "message": "Using deterministic demonstration AIS telemetry dataset."
        }

    def get_vessel_tracks(
        self,
        bbox: Dict[str, float],
        start_time: str,
        end_time: str
    ) -> List[Dict[str, Any]]:
        """Returns deterministic offshore AIS vessel tracks near Arabian Sea sector."""
        min_lat = bbox.get("min_lat", 18.0)
        
        # Scene 2: Goa Sector (~15.4N)
        if 14.5 <= min_lat <= 16.5:
            from app.data.demo_scenario import get_demo_incident_data
            return get_demo_incident_data("SD-SAR-002")["vessels"]
        
        # Scene 3: Khambhat / Gujarat Sector (~20.3N)
        elif 19.5 <= min_lat <= 21.5:
            from app.data.demo_scenario import get_demo_incident_data
            return get_demo_incident_data("SD-SAR-003")["vessels"]
        
        # Scene 1: Mumbai High Sector (~18.5N)
        from app.data.demo_scenario import get_demo_incident_data
        return get_demo_incident_data("SD-SAR-001")["vessels"]


class DemoEnvironmentalProvider(BaseEnvironmentalProvider):
    """
    Demonstration Environmental Data Provider.
    Simulates wind & ocean surface current telemetry retrieval.
    """

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "source_type": "ENVIRONMENTAL_METEOROLOGY",
            "provider_name": "DemoEnvironmentalProvider",
            "display_status": "DEMO ENVIRONMENTAL DATA",
            "status_code": "DEMO_DATA",
            "is_connected": False,
            "message": "Loaded demonstration wind & surface current dataset."
        }

    def get_conditions(
        self,
        lat: float,
        lon: float,
        timestamp: str
    ) -> Dict[str, Any]:
        if 14.5 <= lat <= 16.5:
            return {
                "wind_speed_kmh": 14.0,
                "wind_direction_deg": 315.0,  # NW
                "wind_direction_label": "NW",
                "current_speed_ms": 0.35,
                "current_direction_deg": 135.0,  # SE
                "current_direction_label": "SE",
                "sea_state": "Smooth-Moderate / Code 2",
                "data_source": "Demonstration wind/current dataset"
            }
        elif 19.5 <= lat <= 21.5:
            return {
                "wind_speed_kmh": 22.0,
                "wind_direction_deg": 270.0,  # W
                "wind_direction_label": "W",
                "current_speed_ms": 0.55,
                "current_direction_deg": 90.0,  # E
                "current_direction_label": "E",
                "sea_state": "Moderate / Code 4",
                "data_source": "Demonstration wind/current dataset"
            }
        
        return {
            "wind_speed_kmh": 18.0,
            "wind_direction_deg": 45.0,  # NE
            "wind_direction_label": "NE",
            "current_speed_ms": 0.42,
            "current_direction_deg": 225.0,  # SW
            "current_direction_label": "SW",
            "sea_state": "Slight / Code 3",
            "data_source": "Demonstration wind/current dataset"
        }
