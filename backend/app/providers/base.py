from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseSatelliteProvider(ABC):
    """Abstract Base Class for Satellite Imagery Providers."""
    
    @abstractmethod
    def get_provider_status(self) -> Dict[str, Any]:
        """Returns provider connectivity status and metadata."""
        pass

    @abstractmethod
    def list_available_scenes(self) -> List[Dict[str, Any]]:
        """Lists available SAR satellite acquisitions."""
        pass

    @abstractmethod
    def get_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves raw SAR scene image bytes and spatial metadata."""
        pass


class BaseAISProvider(ABC):
    """Abstract Base Class for AIS Telemetry Providers."""
    
    @abstractmethod
    def get_provider_status(self) -> Dict[str, Any]:
        """Returns provider connectivity status and metadata."""
        pass

    @abstractmethod
    def get_vessel_tracks(
        self,
        bbox: Dict[str, float],
        start_time: str,
        end_time: str
    ) -> List[Dict[str, Any]]:
        """Fetches vessel track records within geographic bbox and time window."""
        pass


class BaseEnvironmentalProvider(ABC):
    """Abstract Base Class for Marine Weather & Surface Ocean Current Providers."""
    
    @abstractmethod
    def get_provider_status(self) -> Dict[str, Any]:
        """Returns provider connectivity status and metadata."""
        pass

    @abstractmethod
    def get_conditions(
        self,
        lat: float,
        lon: float,
        timestamp: str
    ) -> Dict[str, Any]:
        """Fetches wind vector and ocean current vector at specified coordinate and time."""
        pass
