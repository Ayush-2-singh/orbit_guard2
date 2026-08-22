/**
 * OrbitGuard API Client
 * 
 * Handles all communication between frontend and backend.
 * Provides typed methods for satellite data, ML analysis, and predictions.
 */

// ─── Configuration ──────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Types ──────────────────────────────────────────────────────────
export interface Satellite {
  id: string;
  name?: string;
  operator: string;
  orbit_type: 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'OTHER';
  altitude_km: number;
  inclination_deg: number;
  eccentricity: number;
  object_type: 'satellite' | 'debris' | 'rocket_body';
  status: 'Nominal' | 'Monitor' | 'Alert' | 'Critical';
  mass_kg?: number;
  cross_section_m2?: number;
  risk_score: number;
  collision_probability: number;
  relative_velocity_kms: number;
  miss_distance_m: number;
  conjunction_count: number;
  orbital_congestion: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  satellite_id: string;
  risk_score: number;
  collision_probability: number;
  risk_factors: {
    altitude: number;
    congestion: number;
    object_type: number;
    eccentricity: number;
    size: number;
    inclination: number;
  };
  recommendations: string[];
  confidence: number;
  model_version: string;
}

export interface ConjunctionEvent {
  primary: string;
  secondary: string;
  time_to_closest_approach: string;
  miss_distance_km: number;
  relative_velocity_kms: number;
  probability_of_collision: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface OrbitalDensity {
  altitude_range: string;
  label: string;
  density: number;
  object_count: number;
}

export interface SystemStats {
  total_tracked: number;
  active_satellites: number;
  debris_objects: number;
  high_risk_events: number;
  conjunctions_detected: number;
  alerts_active: number;
}

export interface ThreatSummary {
  threats: {
    critical: Array<{ id: string; operator: string; risk_score: number; reason: string }>;
    high: Array<{ id: string; operator: string; risk_score: number; reason: string }>;
    moderate: Array<{ id: string; operator: string; risk_score: number; reason: string }>;
    low: Array<{ id: string; operator: string; risk_score: number; reason: string }>;
  };
  summary: {
    critical_count: number;
    high_count: number;
    moderate_count: number;
    low_count: number;
    total_tracked: number;
  };
}

// ─── API Client ─────────────────────────────────────────────────────
class OrbitGuardAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // ── Satellite Endpoints ──────────────────────────────────────────

  async getSatellites(): Promise<Satellite[]> {
    return this.request<Satellite[]>('/api/satellites/');
  }

  async getSatellite(id: string): Promise<Satellite> {
    return this.request<Satellite>(`/api/satellites/${id}`);
  }

  async createSatellite(sat: Partial<Satellite>): Promise<Satellite> {
    return this.request<Satellite>('/api/satellites/', {
      method: 'POST',
      body: JSON.stringify(sat),
    });
  }

  async createSatellitesBatch(satellites: Partial<Satellite>[]): Promise<Satellite[]> {
    return this.request<Satellite[]>('/api/satellites/batch', {
      method: 'POST',
      body: JSON.stringify({ satellites }),
    });
  }

  async uploadCSV(file: File): Promise<Satellite[]> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/satellites/upload-csv`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'CSV upload failed');
    }

    return response.json();
  }

  async deleteSatellite(id: string): Promise<void> {
    await this.request(`/api/satellites/${id}`, { method: 'DELETE' });
  }

  async getStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/satellites/stats/summary');
  }

  // ── Analysis Endpoints ──────────────────────────────────────────

  async assessRisk(satelliteId: string): Promise<RiskAssessment> {
    return this.request<RiskAssessment>(`/api/analysis/assess/${satelliteId}`, {
      method: 'POST',
    });
  }

  async assessBatchRisk(satelliteIds: string[]): Promise<{ results: Array<{ satellite_id: string; risk_score: number; collision_probability: number }>; total: number }> {
    return this.request('/api/analysis/assess-batch', {
      method: 'POST',
      body: JSON.stringify(satelliteIds),
    });
  }

  async getConjunctions(timeWindowHours: number = 72): Promise<ConjunctionEvent[]> {
    return this.request<ConjunctionEvent[]>(`/api/analysis/conjunctions?time_window_hours=${timeWindowHours}`);
  }

  async getOrbitalDensity(): Promise<OrbitalDensity[]> {
    return this.request<OrbitalDensity[]>('/api/analysis/orbital-density');
  }

  async getRiskDistribution(): Promise<{
    distribution: Array<{ range: string; label: string; count: number }>;
    average: number;
    max: number;
    min: number;
    total: number;
  }> {
    return this.request('/api/analysis/risk-distribution');
  }

  async getThreatSummary(): Promise<ThreatSummary> {
    return this.request<ThreatSummary>('/api/analysis/threat-summary');
  }

  // ── Health Check ────────────────────────────────────────────────

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/api/health');
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Singleton Export ───────────────────────────────────────────────
export const api = new OrbitGuardAPI();

// ─── Helper Functions ───────────────────────────────────────────────

/**
 * Convert API satellite to dashboard format
 */
export function toDashboardSatellite(sat: Satellite) {
  return {
    id: sat.id,
    operator: sat.operator,
    orbit: `${sat.orbit_type} ${sat.altitude_km}km`,
    status: sat.status,
    risk: Math.round(sat.risk_score),
    // Additional ML data
    collision_probability: sat.collision_probability,
    relative_velocity: sat.relative_velocity_kms,
    miss_distance: sat.miss_distance_m,
    congestion: sat.orbital_congestion,
    object_type: sat.object_type,
    altitude: sat.altitude_km,
    inclination: sat.inclination_deg,
  };
}

/**
 * Convert CSV row to satellite object
 */
export function csvRowToSatellite(row: Record<string, string>): Partial<Satellite> {
  const id = row.id || row.ID || row.object_id || `CSV-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const operator = row.operator || row.Operator || row.owner || 'Unknown';
  const orbit = row.orbit || row.Orbit || row.altitude || '';
  const status = row.status || row.Status || 'Nominal';
  const risk = row.risk || row.Risk || row.score;

  // Parse orbit string
  let altitude = 550;
  let orbitType: Satellite['orbit_type'] = 'LEO';
  
  if (orbit) {
    const match = orbit.match(/(\d+)/);
    if (match) altitude = parseInt(match[1]);
    if (orbit.toUpperCase().includes('GEO')) orbitType = 'GEO';
    else if (orbit.toUpperCase().includes('MEO')) orbitType = 'MEO';
  }

  return {
    id,
    operator,
    orbit_type: orbitType,
    altitude_km: altitude,
    object_type: id.toLowerCase().includes('deb') ? 'debris' : 'satellite',
    status: status as Satellite['status'],
    risk_score: risk ? Math.min(100, Math.max(0, parseInt(risk) || 10)) : undefined,
  };
}
