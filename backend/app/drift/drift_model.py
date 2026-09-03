import math
from typing import Dict, Any, List
from app.geospatial.geo_utils import move_point, haversine_distance, clip_path_to_ocean, is_point_in_ocean, get_approx_coastline_lon

class OceanDriftModel:
    """
    Physically-inspired Ocean Drift Reconstruction Engine.
    Simulates oil slick transport under combined surface wind leeway and ocean surface currents.
    
    Advection formula:
    V_drift = V_current + leeway_factor * V_wind
    """

    def __init__(self, wind_leeway_factor: float = 0.035):
        # 3.5% wind leeway factor (standard marine oil spill response value)
        self.wind_leeway_factor = wind_leeway_factor

    def compute_drift_vector(
        self,
        wind_speed_kmh: float,
        wind_dir_deg: float,
        current_speed_ms: float,
        current_dir_deg: float
    ) -> tuple[float, float]:
        """
        Calculates net drift speed in km/h and net direction in degrees (direction TO which drift moves).
        Note: Wind direction is conventionally direction FROM which wind blows.
        """
        # Wind vector (moves towards opposite direction: dir + 180 mod 360)
        wind_to_dir_rad = math.radians((wind_dir_deg + 180) % 360)
        wind_speed_ms = (wind_speed_kmh * 1000.0) / 3600.0
        
        # Wind leeway contribution (3.5% of wind speed)
        wind_u = self.wind_leeway_factor * wind_speed_ms * math.sin(wind_to_dir_rad)
        wind_v = self.wind_leeway_factor * wind_speed_ms * math.cos(wind_to_dir_rad)

        # Current vector (conventionally direction TO which current flows)
        curr_dir_rad = math.radians(current_dir_deg)
        curr_u = current_speed_ms * math.sin(curr_dir_rad)
        curr_v = current_speed_ms * math.cos(curr_dir_rad)

        # Total net drift vector components in m/s
        net_u = curr_u + wind_u
        net_v = curr_v + wind_v

        net_speed_ms = math.sqrt(net_u ** 2 + net_v ** 2)
        net_speed_kmh = (net_speed_ms * 3600.0) / 1000.0
        
        net_dir_deg = (math.degrees(math.atan2(net_u, net_v)) + 360.0) % 360.0

        return net_speed_kmh, net_dir_deg

    def backcast_origin(
        self,
        spill_lat: float,
        spill_lon: float,
        wind_speed_kmh: float = 18.0,
        wind_dir_deg: float = 45.0,  # NE
        current_speed_ms: float = 0.42,  # ~1.5 km/h
        current_dir_deg: float = 225.0,  # SW
        hours_back: float = 2.5,
        time_steps: int = 5
    ) -> Dict[str, Any]:
        """
        Runs drift model BACKWARDS in time from detected spill centroid to reconstruct historical positions
        and determine the probable origin zone.
        """
        drift_speed_kmh, drift_dir_deg = self.compute_drift_vector(
            wind_speed_kmh, wind_dir_deg, current_speed_ms, current_dir_deg
        )

        # Backward direction is opposite of forward drift direction
        reverse_dir_deg = (drift_dir_deg + 180.0) % 360.0
        dt_hours = hours_back / time_steps

        trajectory = []
        curr_lat, curr_lon = spill_lat, spill_lon
        
        # Add initial spill position (T=0)
        trajectory.append({
            "step": 0,
            "hours_ago": 0.0,
            "lat": round(curr_lat, 5),
            "lon": round(curr_lon, 5),
            "uncertainty_radius_km": 0.5
        })

        for i in range(1, time_steps + 1):
            step_hours = i * dt_hours
            dist_km = drift_speed_kmh * dt_hours
            curr_lat, curr_lon = move_point(curr_lat, curr_lon, dist_km, reverse_dir_deg)
            
            # Uncertainty grows with time step (+0.6 km per hour of hindcast)
            uncertainty_radius = round(0.5 + (0.6 * step_hours), 2)
            
            # Ensure coordinates do not cross coastline
            if not is_point_in_ocean(curr_lat, curr_lon):
                curr_lon = get_approx_coastline_lon(curr_lat)
                trajectory.append({
                    "step": i,
                    "hours_ago": round(step_hours, 1),
                    "lat": round(curr_lat, 5),
                    "lon": round(curr_lon, 5),
                    "uncertainty_radius_km": uncertainty_radius
                })
                break

            trajectory.append({
                "step": i,
                "hours_ago": round(step_hours, 1),
                "lat": round(curr_lat, 5),
                "lon": round(curr_lon, 5),
                "uncertainty_radius_km": uncertainty_radius
            })

        probable_origin = trajectory[-1]
        origin_lat = probable_origin["lat"]
        origin_lon = probable_origin["lon"]
        origin_radius_km = probable_origin["uncertainty_radius_km"]

        # Generate origin uncertainty polygon coordinates (circle buffer)
        origin_polygon = self._generate_circle_polygon(origin_lat, origin_lon, origin_radius_km)

        return {
            "drift_speed_kmh": round(drift_speed_kmh, 2),
            "drift_direction_deg": round(drift_dir_deg, 1),
            "reverse_bearing_deg": round(reverse_dir_deg, 1),
            "hindcast_hours": hours_back,
            "backtrack_trajectory": trajectory,
            "probable_origin": {
                "lat": origin_lat,
                "lon": origin_lon,
                "uncertainty_radius_km": origin_radius_km,
                "estimated_release_window": "08:00–10:00 UTC",
                "polygon": origin_polygon
            }
        }

    def forecast_drift(
        self,
        spill_lat: float,
        spill_lon: float,
        wind_speed_kmh: float = 18.0,
        wind_dir_deg: float = 45.0,
        current_speed_ms: float = 0.42,
        current_dir_deg: float = 225.0,
        forecast_intervals: List[int] = [6, 12, 24]
    ) -> List[Dict[str, Any]]:
        """
        Runs drift model FORWARD in time for future spill movement prediction (+6h, +12h, +24h).
        """
        drift_speed_kmh, drift_dir_deg = self.compute_drift_vector(
            wind_speed_kmh, wind_dir_deg, current_speed_ms, current_dir_deg
        )

        forecasts = []
        for hours in forecast_intervals:
            dist_km = drift_speed_kmh * hours
            f_lat, f_lon = move_point(spill_lat, spill_lon, dist_km, drift_dir_deg)
            if not is_point_in_ocean(f_lat, f_lon):
                f_lon = get_approx_coastline_lon(f_lat)
            
            uncertainty_km = round(1.0 + (0.8 * hours), 2)
            poly = self._generate_circle_polygon(f_lat, f_lon, uncertainty_km)

            forecasts.append({
                "hours_ahead": hours,
                "predicted_lat": round(f_lat, 5),
                "predicted_lon": round(f_lon, 5),
                "uncertainty_radius_km": uncertainty_km,
                "polygon": poly,
                "confidence": "High" if hours <= 6 else ("Moderate" if hours <= 12 else "Lower")
            })

        return forecasts

    def _generate_circle_polygon(self, center_lat: float, center_lon: float, radius_km: float, num_points: int = 16) -> List[List[float]]:
        poly = []
        for i in range(num_points):
            bearing = (360.0 / num_points) * i
            plat, plon = move_point(center_lat, center_lon, radius_km, bearing)
            poly.append([round(plat, 5), round(plon, 5)])
        if poly:
            poly.append(poly[0])
        return poly
