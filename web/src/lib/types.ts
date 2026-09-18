export interface MineSite {
  site_id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  mine_type: string;
  avg_grade_pct: number;
  base_target_tpd: number;
  historical_reserve_mt: number;
  current_month_actual: number;
  current_month_target: number;
  current_shortfall_pct: number;
  current_risk_tier: "Low" | "Medium" | "High";
  active_alert: string;
}

export interface OverviewKPIs {
  total_reserves_mt: number;
  month_production_tonnes: number;
  month_target_tonnes: number;
  month_shortfall_pct: number;
  critical_risk_alerts: number;
  fleet_uptime_pct: number;
}

export interface MonthlyTrendItem {
  year_month: string;
  target_tonnes: number;
  actual_tonnes: number;
  shortfall_tonnes: number;
  predicted_tonnes: number;
}

export interface ReserveBlock {
  block_id: string;
  site_id: string;
  site_name: string;
  lat: number;
  lon: number;
  depth_m: number;
  ore_grade_pct: number;
  rock_hardness_mohs: number;
  drill_hole_density: number;
  ndvi_anomaly: number;
  soil_moisture_pct: number;
  surface_temp_c: number;
  spectral_band_ratio: number;
  gravity_anomaly_mgal: number;
  magnetic_susceptibility: number;
  confidence_pct: number;
  estimated_reserve_tonnes: number;
}

export interface ContributingFactor {
  feature: string;
  label: string;
  weight_pct: number;
}

export interface ReservePredictResponse {
  site_id: string;
  predicted_reserve_tonnes: number;
  predicted_reserve_mt: number;
  confidence_pct: number;
  top_contributing_factors: ContributingFactor[];
  all_contributing_factors: ContributingFactor[];
}

export interface ShortfallPredictResponse {
  site_id: string;
  target_tonnes: number;
  predicted_actual_tonnes: number;
  predicted_shortfall_tonnes: number;
  predicted_shortfall_pct: number;
  risk_tier: "Low" | "Medium" | "High";
  risk_probabilities: Record<string, number>;
  primary_risk_driver: string;
  risk_breakdown: { driver: string; label: string; impact_pct: number }[];
  confidence_interval: {
    lower_bound_tonnes: number;
    upper_bound_tonnes: number;
  };
}

export interface ForecastPoint {
  date: string;
  target: number;
  predicted: number;
  actual?: number;
  lower_bound: number;
  upper_bound: number;
  type: "historical" | "forecast";
}

export interface Recommendation {
  id: string;
  priority: "Critical" | "Moderate" | "Advisory";
  category: string;
  issue_detected: string;
  recommended_action: string;
  expected_impact: string;
  implementation_time: string;
}

export interface EquipmentUnit {
  equipment_id: string;
  site_id: string;
  site_name: string;
  equipment_type: string;
  model_make: string;
  status: string;
  failure_risk: "Low" | "Moderate" | "Critical";
  uptime_pct: number;
  total_operating_hours: number;
  hydraulic_pressure_bar: number;
  engine_oil_temp_c: number;
  vibration_rms_mms: number;
  last_maintenance_date: string;
  days_since_maintenance: number;
}

export interface ModelRegistry {
  reserve_model: {
    model_name: string;
    algorithm: string;
    r2_score: number;
    mae: number;
    rmse: number;
    mape_pct: number;
    feature_importances: Record<string, number>;
  };
  forecast_model: {
    model_name: string;
    algorithm: string;
    r2_score: number;
    mae: number;
    rmse: number;
    mape_pct: number;
    feature_importances: Record<string, number>;
  };
  risk_model: {
    model_name: string;
    algorithm: string;
    accuracy: number;
    macro_f1: number;
    classes: string[];
    feature_importances: Record<string, number>;
  };
}
