"""Satellite CRUD API routes."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from ..models.satellite import (
    SatelliteCreate, SatelliteResponse, SatelliteBatchCreate,
    OrbitType, ObjectStatus
)
from ..models.ml_engine import risk_engine, OrbitalParams
from datetime import datetime
import csv
import io

router = APIRouter(prefix="/api/satellites", tags=["satellites"])

# In-memory satellite store (replace with database in production)
satellite_store: dict[str, SatelliteResponse] = {}

# Initialize with default demo satellites
def _init_defaults():
    defaults = [
        SatelliteCreate(
            id="SAT-2847", name="Starlink-4521", operator="SpaceX",
            orbit_type=OrbitType.LEO, altitude_km=550, inclination_deg=53.0,
            eccentricity=0.001, object_type="satellite", mass_kg=260, cross_section_m2=3.2
        ),
        SatelliteCreate(
            id="SAT-9123", name="OneWeb-218", operator="OneWeb",
            orbit_type=OrbitType.LEO, altitude_km=1200, inclination_deg=87.9,
            eccentricity=0.001, object_type="satellite", mass_kg=150, cross_section_m2=2.5
        ),
        SatelliteCreate(
            id="SAT-0381", name="Iridium-117", operator="Iridium",
            orbit_type=OrbitType.LEO, altitude_km=780, inclination_deg=86.4,
            eccentricity=0.0002, object_type="satellite", mass_kg=700, cross_section_m2=8.5
        ),
        SatelliteCreate(
            id="SAT-5502", name="Telstar-19V", operator="Telesat",
            orbit_type=OrbitType.GEO, altitude_km=35786, inclination_deg=0.1,
            eccentricity=0.0002, object_type="satellite", mass_kg=7000, cross_section_m2=35.0
        ),
        SatelliteCreate(
            id="DEB-4921", name="Fengyun-1C Fragment", operator="Debris",
            orbit_type=OrbitType.LEO, altitude_km=620, inclination_deg=98.5,
            eccentricity=0.05, object_type="debris", mass_kg=50, cross_section_m2=0.5
        ),
    ]
    
    for sat in defaults:
        response = _compute_satellite_risk(sat)
        satellite_store[sat.id] = response

def _compute_satellite_risk(sat: SatelliteCreate) -> SatelliteResponse:
    """Compute risk assessment for a satellite."""
    params = OrbitalParams(
        altitude_km=sat.altitude_km,
        inclination_deg=sat.inclination_deg,
        eccentricity=sat.eccentricity,
        object_type=sat.object_type,
        mass_kg=sat.mass_kg or 100,
        cross_section_m2=sat.cross_section_m2 or 1.0,
    )
    
    risk_score, factors, collision_prob = risk_engine.assess_risk(params)
    
    # Compute additional metrics
    relative_velocity = _estimate_relative_velocity(sat.altitude_km, sat.inclination_deg)
    miss_distance = _estimate_miss_distance(sat.altitude_km, factors.congestion_risk)
    congestion = _get_congestion_level(factors.congestion_risk)
    historical_risk = "Elevated" if risk_score > 60 else "Normal"
    
    return SatelliteResponse(
        id=sat.id,
        name=sat.name,
        operator=sat.operator,
        orbit_type=sat.orbit_type,
        altitude_km=sat.altitude_km,
        inclination_deg=sat.inclination_deg,
        eccentricity=sat.eccentricity,
        object_type=sat.object_type,
        status=sat.status,
        mass_kg=sat.mass_kg,
        cross_section_m2=sat.cross_section_m2,
        risk_score=risk_score,
        collision_probability=collision_prob,
        relative_velocity_kms=relative_velocity,
        miss_distance_m=miss_distance,
        conjunction_count=0,
        orbital_congestion=congestion,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


def _estimate_relative_velocity(altitude_km: float, inclination_deg: float) -> float:
    """Estimate typical relative velocity for objects at given orbit."""
    import math
    from ..models.ml_engine import MU_EARTH, EARTH_RADIUS_KM
    
    v = math.sqrt(MU_EARTH / (EARTH_RADIUS_KM + altitude_km))
    # Add component from inclination difference (typical encounter)
    inc_factor = math.sin(math.radians(inclination_deg)) * 5
    return round(v + inc_factor, 1)


def _estimate_miss_distance(altitude_km: float, congestion_risk: float) -> float:
    """Estimate typical miss distance."""
    # In congested zones, miss distances are smaller
    base_distance = 1000 / (congestion_risk + 0.1)
    return round(min(50000, max(10, base_distance)), 0)


def _get_congestion_level(congestion_risk: float) -> str:
    """Get human-readable congestion level."""
    if congestion_risk > 0.8:
        return "Extreme"
    elif congestion_risk > 0.6:
        return "High"
    elif congestion_risk > 0.4:
        return "Moderate"
    elif congestion_risk > 0.2:
        return "Low"
    else:
        return "Minimal"


# Initialize defaults on module load
_init_defaults()


@router.get("/", response_model=List[SatelliteResponse])
async def list_satellites():
    """Get all tracked satellites with risk assessments."""
    return list(satellite_store.values())


@router.get("/{satellite_id}", response_model=SatelliteResponse)
async def get_satellite(satellite_id: str):
    """Get a specific satellite by ID."""
    if satellite_id not in satellite_store:
        raise HTTPException(status_code=404, detail=f"Satellite {satellite_id} not found")
    return satellite_store[satellite_id]


@router.post("/", response_model=SatelliteResponse)
async def create_satellite(sat: SatelliteCreate):
    """Create a new satellite and compute its risk assessment."""
    if sat.id in satellite_store:
        raise HTTPException(status_code=409, detail=f"Satellite {sat.id} already exists")
    
    response = _compute_satellite_risk(sat)
    satellite_store[sat.id] = response
    return response


@router.post("/batch", response_model=List[SatelliteResponse])
async def create_satellites_batch(batch: SatelliteBatchCreate):
    """Create multiple satellites at once (e.g., from CSV upload)."""
    created = []
    for sat in batch.satellites:
        if sat.id not in satellite_store:
            response = _compute_satellite_risk(sat)
            satellite_store[sat.id] = response
            created.append(response)
    return created


@router.post("/upload-csv", response_model=List[SatelliteResponse])
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file with satellite data."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    text = content.decode('utf-8')
    
    try:
        reader = csv.DictReader(io.StringIO(text))
        created = []
        
        for row in reader:
            # Parse columns flexibly
            sat_id = row.get('id', row.get('ID', row.get('object_id', f"CSV-{len(created)+1:04d}")))
            operator = row.get('operator', row.get('Operator', row.get('owner', 'Unknown')))
            
            # Parse orbit
            orbit_str = row.get('orbit', row.get('Orbit', row.get('altitude', '')))
            altitude = 550.0
            orbit_type = OrbitType.LEO
            if orbit_str:
                import re
                nums = re.findall(r'[\d.]+', orbit_str)
                if nums:
                    altitude = float(nums[0])
                if 'GEO' in orbit_str.upper():
                    orbit_type = OrbitType.GEO
                elif 'MEO' in orbit_str.upper():
                    orbit_type = OrbitType.MEO
            
            # Parse risk if provided
            risk_str = row.get('risk', row.get('Risk', row.get('score', '')))
            status_str = row.get('status', row.get('Status', 'Nominal'))
            
            # Determine object type
            obj_type = 'satellite'
            if 'deb' in sat_id.lower() or 'debris' in operator.lower():
                obj_type = 'debris'
            elif 'rkt' in sat_id.lower() or 'rocket' in operator.lower():
                obj_type = 'rocket_body'
            
            sat = SatelliteCreate(
                id=sat_id,
                operator=operator,
                orbit_type=orbit_type,
                altitude_km=altitude,
                object_type=obj_type,
                status=ObjectStatus(status_str) if status_str in ObjectStatus.__members__.values() else ObjectStatus.NOMINAL,
            )
            
            response = _compute_satellite_risk(sat)
            
            # If risk was provided in CSV, use it as override
            if risk_str:
                try:
                    response.risk_score = min(100, max(0, float(risk_str)))
                except ValueError:
                    pass
            
            satellite_store[sat.id] = response
            created.append(response)
        
        return created
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")


@router.delete("/{satellite_id}")
async def delete_satellite(satellite_id: str):
    """Remove a satellite from tracking."""
    if satellite_id not in satellite_store:
        raise HTTPException(status_code=404, detail=f"Satellite {satellite_id} not found")
    del satellite_store[satellite_id]
    return {"message": f"Satellite {satellite_id} removed"}


@router.get("/stats/summary")
async def get_stats():
    """Get system-wide statistics."""
    sats = list(satellite_store.values())
    
    total = len(sats)
    active = sum(1 for s in sats if s.object_type == 'satellite')
    debris = sum(1 for s in sats if s.object_type == 'debris')
    high_risk = sum(1 for s in sats if s.risk_score > 70)
    
    return {
        "total_tracked": total,
        "active_satellites": active,
        "debris_objects": debris,
        "high_risk_events": high_risk,
        "conjunctions_detected": min(total * 2, 50),  # Estimated
        "alerts_active": high_risk,
    }
