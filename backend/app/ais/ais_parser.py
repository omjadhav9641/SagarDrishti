import pandas as pd
import io
import math
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.geospatial.geo_utils import haversine_distance, distance_point_to_segment

class AISParser:
    """
    Normalizes CSV or JSON AIS data supporting various column names (MMSI, vessel_name, SOG, COG, lat, lon, etc.)
    and provides spatial/temporal track filtering.
    """

    COLUMN_MAP = {
        "mmsi": ["mmsi", "MMSI", "VesselMMSI", "vessel_mmsi"],
        "vessel_name": ["vessel_name", "vesselname", "VesselName", "NAME", "name", "ShipName"],
        "timestamp": ["timestamp", "Timestamp", "datetime", "DateTime", "time", "DateUT", "BaseDateTime"],
        "lat": ["lat", "latitude", "LAT", "Latitude", "Y"],
        "lon": ["lon", "longitude", "LON", "LONGITUDE", "Longitude", "X"],
        "sog": ["sog", "SOG", "speed", "Speed", "SpeedOverGround"],
        "cog": ["cog", "COG", "course", "Course", "CourseOverGround"],
        "heading": ["heading", "Heading", "HDG"],
        "vessel_type": ["vessel_type", "vesseltype", "VesselType", "ship_type", "Type"]
    }

    def parse_csv(self, csv_bytes: bytes) -> List[Dict[str, Any]]:
        """Parses CSV bytes into standard AIS records dictionary list."""
        try:
            df = pd.read_csv(io.BytesIO(csv_bytes))
        except Exception as e:
            raise ValueError(f"Invalid CSV format: {str(e)}")

        col_mapping = {}
        for std_name, aliases in self.COLUMN_MAP.items():
            for alias in aliases:
                if alias in df.columns:
                    col_mapping[alias] = std_name
                    break

        required = ["mmsi", "lat", "lon", "timestamp"]
        mapped_values = list(col_mapping.values())
        missing = [r for r in required if r not in mapped_values]
        if missing:
            raise ValueError(f"Missing required columns in CSV: {', '.join(missing)}. Please ensure MMSI, Lat, Lon, and Timestamp exist.")

        df = df.rename(columns=col_mapping)
        
        # Clean defaults
        if "vessel_name" not in df.columns:
            df["vessel_name"] = df["mmsi"].astype(str).apply(lambda m: f"Vessel-{m}")
        if "sog" not in df.columns:
            df["sog"] = 12.0
        if "cog" not in df.columns:
            df["cog"] = 0.0
        if "vessel_type" not in df.columns:
            df["vessel_type"] = "Cargo"

        records = []
        for _, row in df.iterrows():
            try:
                records.append({
                    "mmsi": int(row["mmsi"]),
                    "vessel_name": str(row["vessel_name"]).strip(),
                    "timestamp": str(row["timestamp"]),
                    "lat": float(row["lat"]),
                    "lon": float(row["lon"]),
                    "sog": float(row["sog"]),
                    "cog": float(row["cog"]),
                    "vessel_type": str(row["vessel_type"]).strip()
                })
            except (ValueError, TypeError):
                continue

        return records

    def extract_vessel_tracks(self, ais_records: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
        """Groups AIS point records by vessel MMSI into chronologically sorted track structures."""
        grouped: Dict[int, Dict[str, Any]] = {}
        
        for r in ais_records:
            mmsi = r["mmsi"]
            if mmsi not in grouped:
                grouped[mmsi] = {
                    "mmsi": mmsi,
                    "vessel_name": r["vessel_name"],
                    "vessel_type": r["vessel_type"],
                    "positions": []
                }
            grouped[mmsi]["positions"].append({
                "timestamp": r["timestamp"],
                "lat": r["lat"],
                "lon": r["lon"],
                "sog": r["sog"],
                "cog": r["cog"]
            })

        # Sort positions chronologically
        for mmsi in grouped:
            grouped[mmsi]["positions"].sort(key=lambda x: x["timestamp"])

        return grouped

    def filter_vessels_near_origin(
        self,
        vessel_tracks: Dict[int, Dict[str, Any]],
        origin_lat: float,
        origin_lon: float,
        spatial_threshold_km: float = 15.0
    ) -> Dict[int, Dict[str, Any]]:
        """Filters vessels that passed within spatial_threshold_km of the probable origin zone."""
        filtered = {}
        for mmsi, vessel in vessel_tracks.items():
            min_dist = float("inf")
            closest_pos = None

            positions = vessel["positions"]
            for i in range(len(positions)):
                p = positions[i]
                d = haversine_distance(p["lat"], p["lon"], origin_lat, origin_lon)
                if d < min_dist:
                    min_dist = d
                    closest_pos = p

                # Also check segment distance between consecutive positions
                if i > 0:
                    prev = positions[i - 1]
                    seg_d = distance_point_to_segment(
                        origin_lat, origin_lon,
                        prev["lat"], prev["lon"],
                        p["lat"], p["lon"]
                    )
                    if seg_d < min_dist:
                        min_dist = seg_d

            if min_dist <= spatial_threshold_km:
                vessel_copy = dict(vessel)
                vessel_copy["min_distance_to_origin_km"] = round(min_dist, 2)
                vessel_copy["closest_position"] = closest_pos
                filtered[mmsi] = vessel_copy

        return filtered
