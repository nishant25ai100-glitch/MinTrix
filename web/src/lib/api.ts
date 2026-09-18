import {
  MineSite,
  OverviewKPIs,
  MonthlyTrendItem,
  ReserveBlock,
  ReservePredictResponse,
  ShortfallPredictResponse,
  ForecastPoint,
  Recommendation,
  EquipmentUnit,
  ModelRegistry,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Robust fetch wrapper with timeout
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Fetch to ${endpoint} failed, checking fallback:`, err);
    throw err;
  }
}

export async function getHealth() {
  return fetchApi<{ status: string; service: string }>("/health");
}

export async function getSites(): Promise<MineSite[]> {
  try {
    return await fetchApi<MineSite[]>("/sites");
  } catch {
    return [
      {
        site_id: "balaghat",
        name: "Balaghat Mine",
        state: "Madhya Pradesh",
        district: "Balaghat",
        lat: 21.8048,
        lon: 80.1849,
        mine_type: "Underground",
        avg_grade_pct: 46.5,
        base_target_tpd: 1250,
        historical_reserve_mt: 18.4,
        current_month_actual: 32450,
        current_month_target: 37500,
        current_shortfall_pct: 13.5,
        current_risk_tier: "Medium",
        active_alert: "Balaghat projected 13.5% shortfall (equipment downtime)",
      },
      {
        site_id: "dongri_buzurg",
        name: "Dongri Buzurg Mine",
        state: "Maharashtra",
        district: "Bhandara",
        lat: 21.554,
        lon: 79.6917,
        mine_type: "Opencast",
        avg_grade_pct: 41.2,
        base_target_tpd: 1050,
        historical_reserve_mt: 12.8,
        current_month_actual: 25800,
        current_month_target: 31500,
        current_shortfall_pct: 18.1,
        current_risk_tier: "High",
        active_alert: "Dongri Buzurg projected 18.1% shortfall (weather stoppage)",
      },
      {
        site_id: "gumgaon",
        name: "Gumgaon Mine",
        state: "Maharashtra",
        district: "Nagpur",
        lat: 21.3917,
        lon: 79.0028,
        mine_type: "Underground",
        avg_grade_pct: 39.8,
        base_target_tpd: 680,
        historical_reserve_mt: 7.6,
        current_month_actual: 19200,
        current_month_target: 20400,
        current_shortfall_pct: 5.9,
        current_risk_tier: "Low",
        active_alert: "Nominal operations",
      },
      {
        site_id: "mansar",
        name: "Mansar Mine",
        state: "Maharashtra",
        district: "Nagpur",
        lat: 21.4011,
        lon: 79.2572,
        mine_type: "Mixed Opencast/Underground",
        avg_grade_pct: 38.5,
        base_target_tpd: 760,
        historical_reserve_mt: 8.9,
        current_month_actual: 20500,
        current_month_target: 22800,
        current_shortfall_pct: 10.1,
        current_risk_tier: "Medium",
        active_alert: "Mansar projected 10.1% shortfall (blasting delays)",
      },
      {
        site_id: "ukwa",
        name: "Ukwa Mine",
        state: "Madhya Pradesh",
        district: "Balaghat",
        lat: 21.9667,
        lon: 80.4667,
        mine_type: "Underground",
        avg_grade_pct: 43.8,
        base_target_tpd: 580,
        historical_reserve_mt: 6.2,
        current_month_actual: 16800,
        current_month_target: 17400,
        current_shortfall_pct: 3.4,
        current_risk_tier: "Low",
        active_alert: "Nominal operations",
      },
    ];
  }
}

export async function getOverviewAnalytics(): Promise<{
  kpis: OverviewKPIs;
  monthly_trend: MonthlyTrendItem[];
}> {
  try {
    return await fetchApi<{ kpis: OverviewKPIs; monthly_trend: MonthlyTrendItem[] }>(
      "/analytics/overview"
    );
  } catch {
    return {
      kpis: {
        total_reserves_mt: 487.68,
        month_production_tonnes: 109805,
        month_target_tonnes: 128108,
        month_shortfall_pct: 14.3,
        critical_risk_alerts: 2,
        fleet_uptime_pct: 90.3,
      },
      monthly_trend: [
        { year_month: "2025-01", target_tonnes: 124000, actual_tonnes: 118500, shortfall_tonnes: 5500, predicted_tonnes: 119000 },
        { year_month: "2025-02", target_tonnes: 121000, actual_tonnes: 115200, shortfall_tonnes: 5800, predicted_tonnes: 116000 },
        { year_month: "2025-03", target_tonnes: 128000, actual_tonnes: 124100, shortfall_tonnes: 3900, predicted_tonnes: 123800 },
        { year_month: "2025-04", target_tonnes: 125000, actual_tonnes: 121000, shortfall_tonnes: 4000, predicted_tonnes: 120500 },
        { year_month: "2025-05", target_tonnes: 126000, actual_tonnes: 119000, shortfall_tonnes: 7000, predicted_tonnes: 120000 },
        { year_month: "2025-06", target_tonnes: 120000, actual_tonnes: 104000, shortfall_tonnes: 16000, predicted_tonnes: 106000 },
        { year_month: "2025-07", target_tonnes: 118000, actual_tonnes: 92000, shortfall_tonnes: 26000, predicted_tonnes: 95000 },
        { year_month: "2025-08", target_tonnes: 119000, actual_tonnes: 96500, shortfall_tonnes: 22500, predicted_tonnes: 98000 },
        { year_month: "2025-09", target_tonnes: 122000, actual_tonnes: 108000, shortfall_tonnes: 14000, predicted_tonnes: 110000 },
        { year_month: "2025-10", target_tonnes: 127000, actual_tonnes: 122000, shortfall_tonnes: 5000, predicted_tonnes: 121500 },
        { year_month: "2025-11", target_tonnes: 126000, actual_tonnes: 120500, shortfall_tonnes: 5500, predicted_tonnes: 120000 },
        { year_month: "2025-12", target_tonnes: 128108, actual_tonnes: 109805, shortfall_tonnes: 18303, predicted_tonnes: 112000 },
      ],
    };
  }
}

export async function getReserveBlocks(site_id?: string): Promise<ReserveBlock[]> {
  const query = site_id && site_id !== "all" ? `?site_id=${site_id}` : "";
  return fetchApi<ReserveBlock[]>(`/reserves/blocks${query}`);
}

export async function predictReserve(data: Partial<ReserveBlock>): Promise<ReservePredictResponse> {
  return fetchApi<ReservePredictResponse>("/predict/reserve", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function predictShortfall(data: Record<string, unknown>): Promise<ShortfallPredictResponse> {
  return fetchApi<ShortfallPredictResponse>("/predict/shortfall", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProductionForecast(site_id: string, days = 30): Promise<{
  site_id: string;
  horizon_days: number;
  combined_series: ForecastPoint[];
}> {
  return fetchApi<{ site_id: string; horizon_days: number; combined_series: ForecastPoint[] }>(
    `/production/forecast/${site_id}?days=${days}`
  );
}

export async function getRecommendations(site_id: string): Promise<{
  site_id: string;
  total_actions: number;
  recommendations: Recommendation[];
}> {
  return fetchApi<{ site_id: string; total_actions: number; recommendations: Recommendation[] }>(
    `/recommendations/${site_id}`
  );
}

export async function getEquipment(site_id?: string): Promise<EquipmentUnit[]> {
  const query = site_id && site_id !== "all" ? `?site_id=${site_id}` : "";
  return fetchApi<EquipmentUnit[]>(`/equipment${query}`);
}

export async function getModelInfo(): Promise<ModelRegistry> {
  return fetchApi<ModelRegistry>("/model/info");
}
