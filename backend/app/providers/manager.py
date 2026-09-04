import os
from typing import Dict, Any
from app.providers.base import BaseSatelliteProvider, BaseAISProvider, BaseEnvironmentalProvider
from app.providers.demo_providers import DemoSatelliteProvider, DemoAISProvider, DemoEnvironmentalProvider

class ProviderManager:
    """
    Provider Manager & Adapter Architecture.
    Reads environment variables to select active provider implementations
    and provides unified data source status reporting.
    """

    def __init__(self):
        sat_provider_type = os.getenv("SATELLITE_PROVIDER", "demo").lower()
        ais_provider_type = os.getenv("AIS_PROVIDER", "demo").lower()
        env_provider_type = os.getenv("ENVIRONMENT_PROVIDER", "demo").lower()

        # Satellite Provider Initialization
        if sat_provider_type == "demo":
            self.satellite_provider: BaseSatelliteProvider = DemoSatelliteProvider()
        else:
            # Future real provider integration point (e.g. Copernicus Open Access Hub / Sentinel API)
            self.satellite_provider = DemoSatelliteProvider()

        # AIS Provider Initialization
        if ais_provider_type == "demo":
            self.ais_provider: BaseAISProvider = DemoAISProvider()
        else:
            # Future real provider integration point (e.g. SPIRE / MarineTraffic API)
            self.ais_provider = DemoAISProvider()

        # Environmental Provider Initialization
        if env_provider_type == "demo":
            self.environmental_provider: BaseEnvironmentalProvider = DemoEnvironmentalProvider()
        else:
            # Future real provider integration point (e.g. OpenWave / ERA5 API)
            self.environmental_provider = DemoEnvironmentalProvider()

    def get_data_sources_status(self) -> Dict[str, Any]:
        """Returns honest data-source status breakdown for system UI and audit."""
        sat_status = self.satellite_provider.get_provider_status()
        ais_status = self.ais_provider.get_provider_status()
        env_status = self.environmental_provider.get_provider_status()

        return {
            "sar_source": {
                "name": "SAR Satellite Feed",
                "status": sat_status["display_status"],
                "code": sat_status["status_code"],
                "provider": sat_status["provider_name"],
                "message": sat_status["message"]
            },
            "ais_source": {
                "name": "AIS Vessel Telemetry",
                "status": ais_status["display_status"],
                "code": ais_status["status_code"],
                "provider": ais_status["provider_name"],
                "message": ais_status["message"]
            },
            "environmental_source": {
                "name": "Ocean & Wind Hydrodynamics",
                "status": env_status["display_status"],
                "code": env_status["status_code"],
                "provider": env_status["provider_name"],
                "message": env_status["message"]
            },
            "pipeline_status": "READY"
        }

provider_manager = ProviderManager()
