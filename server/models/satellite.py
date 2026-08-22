"""Satellite data models for OrbitGuard backend."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid


class OrbitType(str, Enum):
    LEO = "LEO"      # Low Earth Orbit (160-2000 km)
    MEO = "MEO"      # Medium Earth Orbit (2000-35786 km)
    GEO = "GEO"      # Geostationary Orbit (35786 km)
    HEO = "HEO"      # Highly Elliptical Orbit
    OTHER = "OTHER"


class ObjectStatus(str, Enum):
    NOMINAL = "Nominal"
    MONITOR = "Monitor"
    ALERT = "Alert"
    CRITICAL = "Critical"


class SatelliteBase(BaseModel):
    """Base satellite data."""
    id: str = Field(default_factory=lambda: f"SAT-{uuid.uuid4().hex[:4].upper()}")
    name: Optional[str] = None
    operator: str = "Unknown"
    orbit_type: OrbitType = OrbitType.LEO
    altitude_km: float = Field(ge=0, le=100000, default=550)
    inclination_deg: float = Field(ge=0, le=180, default=53.0)
    eccentricity: float = Field(ge=0, le=1, default=0.001)
    object_type: str = "satellite"  # satellite, debris, rocket_body
    status: ObjectStatus = ObjectStatus.NOMINAL
    mass_kg: Optional[float] = None
    cross_section_m2: Optional[float] = None


class SatelliteCreate(SatelliteBase):
    """Create a new satellite."""
    pass


class SatelliteResponse(SatelliteBase):
    """Satellite with computed risk data."""
    risk_score: float = Field(ge=0, le=100, default=0)
    collision_probability: float = Field(ge=0, le=1, default=0)
    relative_velocity_kms: float = 0
    miss_distance_m: float = 0
    conjunction_count: int = 0
    orbital_congestion: str = "Low"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SatelliteBatchCreate(BaseModel):
    """Batch upload satellites."""
    satellites: List[SatelliteCreate]


class RiskAssessment(BaseModel):
    """Risk assessment result from ML model."""
    satellite_id: str
    risk_score: float
    collision_probability: float
    risk_factors: dict
    recommendations: List[str]
    confidence: float
    model_version: str = "1.0.0"


class ConjunctionEvent(BaseModel):
    """Predicted conjunction event."""
    id: str = Field(default_factory=lambda: f"CONJ-{uuid.uuid4().hex[:6].upper()}")
    primary_satellite: str
    secondary_object: str
    time_to_closest_approach: str  # e.g., "T+02:14"
    miss_distance_km: float
    relative_velocity_kms: float
    probability_of_collision: float
    risk_level: str  # Low, Moderate, High, Critical
    predicted_at: datetime = Field(default_factory=datetime.utcnow)


class OrbitalDensity(BaseModel):
    """Orbital density data for heatmap."""
    altitude_range: str
    density: float
    object_count: int


class SystemStats(BaseModel):
    """System-wide statistics."""
    total_tracked: int
    active_satellites: int
    debris_objects: int
    high_risk_events: int
    conjunctions_detected: int
    alerts_active: int
