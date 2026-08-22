"""ML Analysis and Prediction API routes."""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.satellite import RiskAssessment, ConjunctionEvent, OrbitalDensity
from ..models.ml_engine import risk_engine, OrbitalParams
from ..routes.satellites import satellite_store
import uuid

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/assess/{satellite_id}", response_model=RiskAssessment)
async def assess_satellite_risk(satellite_id: str):
    """
    Run ML risk assessment on a specific satellite.
    
    Returns detailed risk factors and recommendations.
    """
    if satellite_id not in satellite_store:
        raise HTTPException(status_code=404, detail=f"Satellite {satellite_id} not found")
    
    sat = satellite_store[satellite_id]
    
    params = OrbitalParams(
        altitude_km=sat.altitude_km,
        inclination_deg=sat.inclination_deg,
        eccentricity=sat.eccentricity,
        object_type=sat.object_type,
        mass_kg=sat.mass_kg or 100,
        cross_section_m2=sat.cross_section_m2 or 1.0,
    )
    
    risk_score, factors, collision_prob = risk_engine.assess_risk(params)
    
    recommendations = risk_engine.generate_recommendations(
        risk_score, factors, sat.object_type
    )
    
    return RiskAssessment(
        satellite_id=satellite_id,
        risk_score=risk_score,
        collision_probability=collision_prob,
        risk_factors={
            "altitude": round(factors.altitude_risk, 3),
            "congestion": round(factors.congestion_risk, 3),
            "object_type": round(factors.object_type_risk, 3),
            "eccentricity": round(factors.eccentricity_risk, 3),
            "size": round(factors.size_risk, 3),
            "inclination": round(factors.inclination_risk, 3),
        },
        recommendations=recommendations,
        confidence=0.85,
        model_version=risk_engine.model_version,
    )


@router.post("/assess-batch")
async def assess_batch_risk(satellite_ids: List[str]):
    """
    Run risk assessment on multiple satellites at once.
    """
    results = []
    for sid in satellite_ids:
        if sid in satellite_store:
            sat = satellite_store[sid]
            params = OrbitalParams(
                altitude_km=sat.altitude_km,
                inclination_deg=sat.inclination_deg,
                eccentricity=sat.eccentricity,
                object_type=sat.object_type,
                mass_kg=sat.mass_kg or 100,
                cross_section_m2=sat.cross_section_m2 or 1.0,
            )
            risk_score, factors, collision_prob = risk_engine.assess_risk(params)
            results.append({
                "satellite_id": sid,
                "risk_score": risk_score,
                "collision_probability": collision_prob,
                "status": "assessed"
            })
    
    return {"results": results, "total": len(results)}


@router.get("/conjunctions", response_model=List[dict])
async def predict_conjunctions(time_window_hours: int = 72):
    """
    Predict potential conjunction events for all tracked satellites.
    
    Uses orbital parameters to estimate close approaches.
    """
    satellites = [
        {
            "id": sat.id,
            "altitude_km": sat.altitude_km,
            "inclination_deg": sat.inclination_deg,
            "eccentricity": sat.eccentricity,
            "object_type": sat.object_type,
        }
        for sat in satellite_store.values()
    ]
    
    conjunctions = risk_engine.predict_conjunctions(satellites, time_window_hours)
    return conjunctions


@router.get("/orbital-density")
async def get_orbital_density():
    """
    Compute orbital density across altitude bands.
    
    Returns density data for heatmap visualization.
    """
    satellites = [
        {
            "id": sat.id,
            "altitude_km": sat.altitude_km,
            "inclination_deg": sat.inclination_deg,
        }
        for sat in satellite_store.values()
    ]
    
    density = risk_engine.compute_orbital_density(satellites)
    return density


@router.get("/risk-distribution")
async def get_risk_distribution():
    """
    Get distribution of risk scores across all satellites.
    
    Useful for dashboard statistics and visualization.
    """
    sats = list(satellite_store.values())
    
    if not sats:
        return {"distribution": [], "average": 0, "max": 0, "min": 0}
    
    scores = [sat.risk_score for sat in sats]
    
    # Create histogram bins
    bins = [0, 20, 40, 60, 80, 100]
    labels = ["Very Low", "Low", "Medium", "High", "Critical"]
    distribution = []
    
    for i in range(len(bins) - 1):
        count = sum(1 for s in scores if bins[i] <= s < bins[i+1])
        distribution.append({
            "range": f"{bins[i]}-{bins[i+1]}",
            "label": labels[i],
            "count": count,
        })
    
    return {
        "distribution": distribution,
        "average": round(sum(scores) / len(scores), 1),
        "max": max(scores),
        "min": min(scores),
        "total": len(scores),
    }


@router.get("/threat-summary")
async def get_threat_summary():
    """
    Get a summary of current threats across all tracked objects.
    """
    sats = list(satellite_store.values())
    
    threats = {
        "critical": [],
        "high": [],
        "moderate": [],
        "low": [],
    }
    
    for sat in sats:
        if sat.risk_score >= 80:
            threats["critical"].append({
                "id": sat.id,
                "operator": sat.operator,
                "risk_score": sat.risk_score,
                "reason": f"High collision probability ({sat.collision_probability:.4f})",
            })
        elif sat.risk_score >= 60:
            threats["high"].append({
                "id": sat.id,
                "operator": sat.operator,
                "risk_score": sat.risk_score,
                "reason": f"Elevated risk in {sat.orbital_congestion} congestion zone",
            })
        elif sat.risk_score >= 40:
            threats["moderate"].append({
                "id": sat.id,
                "operator": sat.operator,
                "risk_score": sat.risk_score,
                "reason": f"Standard monitoring recommended",
            })
        else:
            threats["low"].append({
                "id": sat.id,
                "operator": sat.operator,
                "risk_score": sat.risk_score,
                "reason": "Nominal operations",
            })
    
    return {
        "threats": threats,
        "summary": {
            "critical_count": len(threats["critical"]),
            "high_count": len(threats["high"]),
            "moderate_count": len(threats["moderate"]),
            "low_count": len(threats["low"]),
            "total_tracked": len(sats),
        }
    }
