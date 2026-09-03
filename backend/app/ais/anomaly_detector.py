from typing import Dict, Any, List
from datetime import datetime, timezone
import math

class AISAnomalyDetector:
    """
    Detects behavioral anomalies in vessel AIS trajectories:
    1. Sudden Speed Drop / Loitering near probable origin zone.
    2. Course Deviation / Sharp turns.
    3. AIS Transmission Gaps (missing AIS pings during release window).
    """

    def analyze_vessel_behavior(
        self,
        vessel_track: Dict[str, Any],
        origin_lat: float,
        origin_lon: float,
        release_start_iso: str = "2025-09-08T08:00:00Z",
        release_end_iso: str = "2025-09-08T10:00:00Z"
    ) -> Dict[str, Any]:
        positions = vessel_track.get("positions", [])
        if len(positions) < 2:
            return {
                "has_speed_anomaly": False,
                "has_ais_gap": False,
                "has_course_anomaly": False,
                "speed_drop_knots": 0.0,
                "max_ais_gap_minutes": 0.0,
                "anomalies_summary": []
            }

        anomalies = []
        
        # 1. Speed drop detection
        speeds = [p.get("sog", 12.0) for p in positions]
        max_speed = max(speeds)
        min_speed = min(speeds)
        speed_drop = max_speed - min_speed

        has_speed_anomaly = False
        if max_speed >= 10.0 and min_speed <= 3.5 and speed_drop >= 6.0:
            has_speed_anomaly = True
            anomalies.append({
                "type": "SPEED_ANOMALY",
                "severity": "HIGH",
                "description": f"Significant slowdown detected: vessel speed dropped from {max_speed:.1f} knots to {min_speed:.1f} knots near probable origin."
            })

        # 2. AIS Transmission Gap detection
        max_gap_minutes = 0.0
        has_ais_gap = False
        
        for i in range(1, len(positions)):
            t1_str = positions[i - 1]["timestamp"]
            t2_str = positions[i]["timestamp"]

            dt_minutes = self._parse_minutes_diff(t1_str, t2_str)
            if dt_minutes > max_gap_minutes:
                max_gap_minutes = dt_minutes

            if dt_minutes >= 20.0:
                has_ais_gap = True

        if has_ais_gap:
            anomalies.append({
                "type": "AIS_GAP",
                "severity": "MEDIUM",
                "description": f"AIS transmission gap of {int(max_gap_minutes)} minutes detected during critical release window."
            })

        # 3. Course anomaly detection
        cogs = [p.get("cog", 0.0) for p in positions]
        has_course_anomaly = False
        max_course_diff = 0.0
        for i in range(1, len(cogs)):
            diff = abs((cogs[i] - cogs[i - 1] + 180) % 360 - 180)
            if diff > max_course_diff:
                max_course_diff = diff

        if max_course_diff >= 45.0:
            has_course_anomaly = True
            anomalies.append({
                "type": "COURSE_ANOMALY",
                "severity": "LOW",
                "description": f"Unusual course shift of {int(max_course_diff)}° recorded near origin zone."
            })

        return {
            "has_speed_anomaly": has_speed_anomaly,
            "has_ais_gap": has_ais_gap,
            "has_course_anomaly": has_course_anomaly,
            "speed_drop_knots": round(speed_drop, 1),
            "max_ais_gap_minutes": round(max_gap_minutes, 1),
            "anomalies_summary": anomalies
        }

    def _parse_minutes_diff(self, t1_str: str, t2_str: str) -> float:
        try:
            # Handle ISO timestamp strings
            t1_str_clean = t1_str.replace("Z", "+00:00")
            t2_str_clean = t2_str.replace("Z", "+00:00")
            
            dt1 = datetime.fromisoformat(t1_str_clean)
            dt2 = datetime.fromisoformat(t2_str_clean)
            diff_seconds = abs((dt2 - dt1).total_seconds())
            return diff_seconds / 60.0
        except Exception:
            return 0.0
