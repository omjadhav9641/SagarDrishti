import math

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the initial bearing from point 1 to point 2 in degrees (0-360)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360.0) % 360.0

def move_point(lat: float, lon: float, distance_km: float, bearing_deg: float) -> tuple[float, float]:
    """Move a (lat, lon) point by distance in km along a given bearing in degrees."""
    d_rad = distance_km / EARTH_RADIUS_KM
    b_rad = math.radians(bearing_deg)
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)

    new_lat_rad = math.asin(
        math.sin(lat_rad) * math.cos(d_rad) +
        math.cos(lat_rad) * math.sin(d_rad) * math.cos(b_rad)
    )

    new_lon_rad = lon_rad + math.atan2(
        math.sin(b_rad) * math.sin(d_rad) * math.cos(lat_rad),
        math.cos(d_rad) - math.sin(lat_rad) * math.sin(new_lat_rad)
    )

    return math.degrees(new_lat_rad), math.degrees(new_lon_rad)

def get_approx_coastline_lon(lat: float) -> float:
    """Returns approximate coastline longitude for Indian Arabian Sea coast."""
    if 18.0 <= lat <= 19.5:
        # Mumbai / Maharashtra coastline interpolation
        return 72.88 - (lat - 18.5) * 0.12
    elif 15.0 <= lat < 18.0:
        # Goa / South Maharashtra
        return 73.4 - (lat - 15.0) * 0.17
    elif 19.5 < lat <= 23.0:
        # Gujarat / Gulf of Khambhat
        return 72.70 - (lat - 19.5) * 0.10
    elif 8.0 <= lat < 15.0:
        # Karnataka / Kerala
        return 76.5 - (lat - 8.0) * 0.44
    return 72.90

def is_point_in_ocean(lat: float, lon: float) -> bool:
    """Validates if a (lat, lon) coordinate is in the ocean (offshore India west coast)."""
    coast_lon = get_approx_coastline_lon(lat)
    return lon <= coast_lon

def clip_path_to_ocean(path: list[dict]) -> list[dict]:
    """Clips trajectory steps so they terminate at the coastline and never cross into land."""
    clipped = []
    for pt in path:
        lat = pt.get("lat", pt.get("predicted_lat", 0.0))
        lon = pt.get("lon", pt.get("predicted_lon", 0.0))
        if is_point_in_ocean(lat, lon):
            clipped.append(pt)
        else:
            coast_lon = get_approx_coastline_lon(lat)
            clipped_pt = dict(pt)
            if "lon" in clipped_pt:
                clipped_pt["lon"] = round(coast_lon, 5)
            if "predicted_lon" in clipped_pt:
                clipped_pt["predicted_lon"] = round(coast_lon, 5)
            clipped.append(clipped_pt)
            break
    return clipped

def distance_point_to_segment(plat: float, plon: float, l1lat: float, l1lon: float, l2lat: float, l2lon: float) -> float:
    """Calculates minimum distance in km from point P to line segment L1-L2."""
    d12 = haversine_distance(l1lat, l1lon, l2lat, l2lon)
    if d12 == 0.0:
        return haversine_distance(plat, plon, l1lat, l1lon)

    cos_lat = math.cos(math.radians((l1lat + l2lat + plat) / 3.0))
    px = (plon - l1lon) * cos_lat
    py = plat - l1lat
    lx = (l2lon - l1lon) * cos_lat
    ly = l2lat - l1lat

    l2_dist_sq = lx*lx + ly*ly
    if l2_dist_sq == 0:
        return haversine_distance(plat, plon, l1lat, l1lon)

    t = max(0.0, min(1.0, (px * lx + py * ly) / l2_dist_sq))
    proj_x = l1lon + (t * (l2lon - l1lon))
    proj_y = l1lat + (t * (l2lat - l1lat))

    return haversine_distance(plat, plon, proj_y, proj_x)

def polygon_centroid(coords: list[tuple[float, float]]) -> tuple[float, float]:
    """Calculate centroid of a list of (lat, lon) coordinates."""
    if not coords:
        return 0.0, 0.0
    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lon = sum(c[1] for c in coords) / len(coords)
    return avg_lat, avg_lon
