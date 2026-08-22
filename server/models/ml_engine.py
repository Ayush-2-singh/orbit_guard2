"""
ML Risk Prediction Engine for OrbitGuard.

This module implements:
1. Risk scoring based on orbital parameters
2. Collision probability estimation
3. Conjunction event prediction
4. Orbital congestion analysis

Uses a combination of:
- Physics-based calculations (orbital mechanics)
- Statistical models (risk scoring)
- Rule-based heuristics (congestion, recommendations)
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import math


# ─── Constants ───────────────────────────────────────────────────────
EARTH_RADIUS_KM = 6371.0
LEO_UPPER_KM = 2000.0
MEO_UPPER_KM = 35786.0
GEO_ALTITUDE_KM = 35786.0
MU_EARTH = 398600.4418  # km^3/s^2 (gravitational parameter)


@dataclass
class OrbitalParams:
    """Orbital parameters for a space object."""
    altitude_km: float
    inclination_deg: float
    eccentricity: float
    object_type: str  # satellite, debris, rocket_body
    mass_kg: float
    cross_section_m2: float


@dataclass
class RiskFactors:
    """Individual risk factors contributing to overall score."""
    altitude_risk: float      # 0-1: risk from orbital altitude
    congestion_risk: float    # 0-1: risk from orbital congestion
    object_type_risk: float   # 0-1: risk from object type (debris is riskier)
    eccentricity_risk: float  # 0-1: risk from orbital eccentricity
    size_risk: float          # 0-1: risk from cross-section size
    inclination_risk: float   # 0-1: risk from orbital inclination


class OrbitalRiskEngine:
    """
    ML-powered risk assessment engine for orbital objects.
    
    Uses weighted combination of orbital parameters to compute
    collision probability and risk scores.
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
        
        # Weight distribution for risk factors (sums to 1.0)
        self.weights = {
            'altitude': 0.25,
            'congestion': 0.20,
            'object_type': 0.20,
            'eccentricity': 0.10,
            'size': 0.15,
            'inclination': 0.10,
        }
        
        # Known congestion zones (altitude ranges in km)
        self.congestion_zones = [
            (400, 600, 0.9),    # Starlink mega-constellation zone
            (700, 900, 0.7),    # Popular Sun-synchronous orbits
            (1000, 1400, 0.5),  # Medium LEO
            (20000, 21000, 0.6), # GPS constellation zone
            (35500, 36000, 0.4), # GEO belt
        ]
    
    def compute_altitude_risk(self, altitude_km: float) -> float:
        """
        Compute risk based on orbital altitude.
        
        LEO is most congested and has highest collision risk.
        De-orbit decay is faster in very low orbits.
        """
        if altitude_km < 200:
            return 0.9  # Very low orbit, rapid decay, high debris
        elif altitude_km < 400:
            return 0.7  # Low LEO, high traffic
        elif altitude_km < 600:
            return 0.85  # Starlink zone, very high congestion
        elif altitude_km < 800:
            return 0.75  # Popular SSO zone
        elif altitude_km < 1000:
            return 0.6  # Medium LEO
        elif altitude_km < 2000:
            return 0.4  # Upper LEO
        elif altitude_km < 20000:
            return 0.2  # MEO (relatively clear)
        elif altitude_km < 22000:
            return 0.35  # GPS zone
        elif altitude_km < 36000:
            return 0.15  # Between MEO and GEO
        elif altitude_km < 37000:
            return 0.45  # GEO belt (congested)
        else:
            return 0.1  # Beyond GEO
    
    def compute_congestion_risk(self, altitude_km: float) -> float:
        """Compute risk from orbital congestion at given altitude."""
        for low, high, risk in self.congestion_zones:
            if low <= altitude_km <= high:
                return risk
        
        # Linear interpolation between zones
        for i in range(len(self.congestion_zones) - 1):
            _, high1, risk1 = self.congestion_zones[i]
            low2, _, risk2 = self.congestion_zones[i + 1]
            if high1 < altitude_km < low2:
                # Interpolate
                t = (altitude_km - high1) / (low2 - high1)
                return risk1 * (1 - t) * 0.5 + risk2 * t * 0.5
        
        return 0.1  # Default low congestion
    
    def compute_object_type_risk(self, object_type: str) -> float:
        """Compute risk based on object type."""
        risk_map = {
            'debris': 0.9,      # Debris is uncontrolled, highest risk
            'rocket_body': 0.7,  # Large, uncontrolled
            'satellite': 0.4,    # Controlled, but still at risk
            'unknown': 0.6,
        }
        return risk_map.get(object_type, 0.5)
    
    def compute_eccentricity_risk(self, eccentricity: float) -> float:
        """
        Compute risk from orbital eccentricity.
        
        Higher eccentricity means the object traverses multiple altitude
        bands, increasing encounter probability.
        """
        # Circular orbits (e ≈ 0) are most predictable
        # Highly elliptical orbits cross multiple altitude bands
        return min(1.0, eccentricity * 2.5 + 0.1)
    
    def compute_size_risk(self, cross_section_m2: float, mass_kg: float) -> float:
        """
        Compute risk from object size.
        
        Larger objects are easier to track but also more dangerous
        if they collide with something.
        """
        if cross_section_m2 <= 0 and mass_kg <= 0:
            return 0.5  # Unknown size
        
        # Normalize cross-section (typical satellite: 1-50 m²)
        size_score = min(1.0, cross_section_m2 / 50.0) if cross_section_m2 > 0 else 0.3
        
        # Mass factor (heavier = more dangerous)
        mass_score = min(1.0, mass_kg / 5000.0) if mass_kg > 0 else 0.3
        
        return size_score * 0.6 + mass_score * 0.4
    
    def compute_inclination_risk(self, inclination_deg: float) -> float:
        """
        Compute risk from orbital inclination.
        
        Certain inclinations (like 97-99° for SSO) are very crowded.
        """
        # Sun-synchronous orbit range (very congested)
        if 95 <= inclination_deg <= 100:
            return 0.8
        # Common LEO inclinations
        elif 50 <= inclination_deg <= 55:  # Starlink-like
            return 0.7
        elif 28 <= inclination_deg <= 32:  # Cape Canaveral launches
            return 0.6
        elif 0 <= inclination_deg <= 10:  # Equatorial
            return 0.5
        elif 60 <= inclination_deg <= 65:  # Molniya-like
            return 0.4
        else:
            return 0.3
    
    def assess_risk(self, params: OrbitalParams) -> Tuple[float, RiskFactors, float]:
        """
        Main risk assessment function.
        
        Returns:
            - risk_score (0-100)
            - risk_factors (individual factor scores)
            - collision_probability (0-1)
        """
        # Compute individual risk factors
        factors = RiskFactors(
            altitude_risk=self.compute_altitude_risk(params.altitude_km),
            congestion_risk=self.compute_congestion_risk(params.altitude_km),
            object_type_risk=self.compute_object_type_risk(params.object_type),
            eccentricity_risk=self.compute_eccentricity_risk(params.eccentricity),
            size_risk=self.compute_size_risk(params.cross_section_m2, params.mass_kg),
            inclination_risk=self.compute_inclination_risk(params.inclination_deg),
        )
        
        # Weighted sum
        weighted_score = (
            factors.altitude_risk * self.weights['altitude'] +
            factors.congestion_risk * self.weights['congestion'] +
            factors.object_type_risk * self.weights['object_type'] +
            factors.eccentricity_risk * self.weights['eccentricity'] +
            factors.size_risk * self.weights['size'] +
            factors.inclination_risk * self.weights['inclination']
        )
        
        # Scale to 0-100
        risk_score = round(weighted_score * 100, 1)
        
        # Collision probability (non-linear scaling)
        # Higher risk scores have disproportionately higher collision probability
        collision_prob = round(min(1.0, weighted_score ** 1.5), 4)
        
        return risk_score, factors, collision_prob
    
    def predict_conjunctions(
        self,
        satellites: List[Dict],
        time_window_hours: int = 72
    ) -> List[Dict]:
        """
        Predict potential conjunction events based on orbital parameters.
        
        This uses simplified orbital mechanics to estimate close approaches.
        """
        conjunctions = []
        
        for i, sat1 in enumerate(satellites):
            for sat2 in satellites[i+1:]:
                # Check if orbits could intersect
                alt1 = sat1.get('altitude_km', 550)
                alt2 = sat2.get('altitude_km', 550)
                inc1 = sat1.get('inclination_deg', 53)
                inc2 = sat2.get('inclination_deg', 53)
                
                # Simple intersection check
                alt_diff = abs(alt1 - alt2)
                inc_diff = abs(inc1 - inc2)
                
                # Orbits must be close in altitude and have crossing inclinations
                if alt_diff > 100:
                    continue
                if inc_diff < 1 and alt_diff > 50:
                    continue
                
                # Estimate miss distance based on orbital parameters
                miss_distance = max(1, alt_diff * 0.5 + inc_diff * 2)
                
                # Estimate relative velocity
                v1 = math.sqrt(MU_EARTH / (EARTH_RADIUS_KM + alt1))  # km/s
                v2 = math.sqrt(MU_EARTH / (EARTH_RADIUS_KM + alt2))
                relative_velocity = abs(v1 - v2) + (inc_diff * 0.1)
                
                # Probability of collision (simplified)
                prob = min(1.0, (1.0 / (miss_distance + 1)) * 0.1)
                
                # Risk level
                if prob > 0.01:
                    risk_level = "Critical"
                elif prob > 0.001:
                    risk_level = "High"
                elif prob > 0.0001:
                    risk_level = "Moderate"
                else:
                    risk_level = "Low"
                
                # Random time offset within window
                hours_offset = np.random.uniform(1, time_window_hours)
                minutes = int((hours_offset % 1) * 60)
                hours = int(hours_offset)
                
                conjunctions.append({
                    'primary': sat1.get('id', 'UNKNOWN'),
                    'secondary': sat2.get('id', 'UNKNOWN'),
                    'time_to_closest_approach': f"T+{hours:02d}:{minutes:02d}",
                    'miss_distance_km': round(miss_distance, 1),
                    'relative_velocity_kms': round(relative_velocity, 1),
                    'probability_of_collision': round(prob, 6),
                    'risk_level': risk_level,
                })
        
        # Sort by risk level
        risk_order = {'Critical': 0, 'High': 1, 'Moderate': 2, 'Low': 3}
        conjunctions.sort(key=lambda x: risk_order.get(x['risk_level'], 4))
        
        return conjunctions[:10]  # Return top 10
    
    def compute_orbital_density(self, satellites: List[Dict]) -> List[Dict]:
        """
        Compute orbital density across altitude bands for heatmap visualization.
        """
        # Define altitude bands
        bands = [
            (200, 400, "Very Low LEO"),
            (400, 600, "Low LEO"),
            (600, 800, "Mid LEO"),
            (800, 1000, "Upper LEO"),
            (1000, 1500, "High LEO"),
            (1500, 2000, "Upper LEO Edge"),
            (2000, 5000, "Lower MEO"),
            (5000, 15000, "Mid MEO"),
            (15000, 25000, "Upper MEO"),
            (25000, 35000, "Approaching GEO"),
            (35000, 37000, "GEO Belt"),
            (37000, 50000, "Beyond GEO"),
        ]
        
        density_data = []
        for low, high, name in bands:
            count = sum(
                1 for s in satellites
                if low <= s.get('altitude_km', 550) <= high
            )
            # Add some baseline congestion from known debris population
            baseline = max(0, (high - low) / 1000 * 50)
            total = count + baseline
            density = min(1.0, total / 2000)  # Normalize
            
            density_data.append({
                'altitude_range': f"{low}-{high}km",
                'label': name,
                'density': round(density, 3),
                'object_count': int(total),
            })
        
        return density_data
    
    def generate_recommendations(
        self,
        risk_score: float,
        factors: RiskFactors,
        satellite_type: str
    ) -> List[str]:
        """Generate actionable recommendations based on risk assessment."""
        recommendations = []
        
        if risk_score > 80:
            recommendations.append("🚨 CRITICAL: Immediate collision avoidance maneuver recommended")
            recommendations.append("📡 Increase tracking frequency to every 15 minutes")
        elif risk_score > 60:
            recommendations.append("⚠️ HIGH RISK: Monitor closely for next 24 hours")
            recommendations.append("📋 Prepare contingency maneuver options")
        elif risk_score > 40:
            recommendations.append("🔍 MODERATE: Continue standard monitoring")
        else:
            recommendations.append("✅ LOW RISK: Standard monitoring sufficient")
        
        if factors.congestion_risk > 0.7:
            recommendations.append("🌐 High congestion zone - consider orbit adjustment")
        
        if factors.object_type_risk > 0.8:
            recommendations.append("🎯 Uncontrolled object - active tracking required")
        
        if factors.eccentricity_risk > 0.6:
            recommendations.append("📈 High eccentricity - orbit crosses multiple altitude bands")
        
        if factors.altitude_risk > 0.8:
            recommendations.append("⬇️ Low altitude - atmospheric drag effects significant")
        
        return recommendations


# Singleton instance
risk_engine = OrbitalRiskEngine()
