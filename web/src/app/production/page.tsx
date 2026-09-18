"use client";

import { useEffect, useState } from "react";
import {
  TrendingDown,
  AlertOctagon,
  Sparkles,
  Zap,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSite } from "@/context/site-context";
import { getProductionForecast, predictShortfall } from "@/lib/api";
import { ForecastPoint, ShortfallPredictResponse } from "@/lib/types";

export default function ProductionPage() {
  const { sites, selectedSite } = useSite();
  const currentSiteId = selectedSite === "all" ? "balaghat" : selectedSite;
  const currentSite = sites.find((s) => s.site_id === currentSiteId) || sites[0];

  const [forecastDays, setForecastDays] = useState<number>(30);
  const [series, setSeries] = useState<ForecastPoint[]>([]);

  // Shortfall Interactive Predictor state
  const [targetTonnes, setTargetTonnes] = useState<number>(1250);
  const [downtimeHours, setDowntimeHours] = useState<number>(12.5);
  const [rainfallMm, setRainfallMm] = useState<number>(25.0);
  const [blastingDelay, setBlastingDelay] = useState<number>(1.5);
  const [laborAttendance, setLaborAttendance] = useState<number>(88.0);

  const [prediction, setPrediction] = useState<ShortfallPredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    if (currentSite) {
      setTargetTonnes(currentSite.base_target_tpd);
    }
  }, [currentSite]);

  useEffect(() => {
    getProductionForecast(currentSiteId, forecastDays)
      .then((data) => setSeries(data.combined_series))
      .catch((err) => console.warn(err));

    runShortfallPredict();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSiteId, forecastDays]);

  const runShortfallPredict = async () => {
    setIsPredicting(true);
    try {
      const res = await predictShortfall({
        site_id: currentSiteId,
        target_tonnes: targetTonnes,
        total_downtime_hours: downtimeHours,
        rainfall_mm: rainfallMm,
        blasting_delay_hours: blastingDelay,
        labor_attendance_pct: laborAttendance,
        excavator_downtime_hours: downtimeHours * 0.45,
        drill_downtime_hours: downtimeHours * 0.25,
        dumper_downtime_hours: downtimeHours * 0.3,
        fleet_utilization_pct: Math.max(40, 100 - downtimeHours * 2.2),
        soil_moisture_pct: 22.0 + rainfallMm * 0.35,
        weather_stoppage_hours: rainfallMm > 25 ? (rainfallMm - 20) * 0.15 : 0,
      });
      setTimeout(() => {
        setPrediction(res);
        setIsPredicting(false);
      }, 300);
    } catch (err) {
      console.error(err);
      setIsPredicting(false);
    }
  };

  const getRiskBadgeColor = (tier?: string) => {
    switch (tier) {
      case "High":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Production & Shortfall Forecasting Engine</span>
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Autoregressive ML
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Forecasting mine output 30/60/90 days in advance using scikit-learn GradientBoosting with weather and machinery telematics.
          </p>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center space-x-2 bg-[#111827] border border-[#1E293B] p-1 rounded-xl text-xs">
          <span className="px-2 text-gray-400 font-medium">Horizon:</span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setForecastDays(d)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                forecastDays === d
                  ? "bg-amber-500 text-black shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Main Forecast Chart with Shaded Confidence Band */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>
                {currentSite ? currentSite.name : "Mine"} — Forward Production Trajectory (Next {forecastDays} Days)
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Historical 14 days baseline + {forecastDays} days predicted trajectory with shaded 95% confidence interval.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-gray-300">
              <span className="w-3 h-0.5 bg-gray-400 inline-block border-t border-dashed" />
              <span>Target Plan</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-3 h-1 bg-emerald-500 inline-block rounded-full" />
              <span>Historical Actual</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-3 h-1 bg-amber-500 inline-block rounded-full" />
              <span>ML Predicted (w/ Band)</span>
            </span>
          </div>
        </div>

        <div className="h-[360px] w-full">
          {series.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B0F17",
                    borderColor: "#1E293B",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#F3F4F6",
                  }}
                  formatter={(val) => [`${Number(val || 0).toLocaleString()} T`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="none"
                  fill="url(#confidenceBand)"
                  name="Upper Confidence (108%)"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Output"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actual Output"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Daily Target"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-500">
              Generating forward forecast...
            </div>
          )}
        </div>
      </div>

      {/* Grid: Risk Attribution & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Model Risk Attribution & Alerts (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Shortfall Early Warning Card */}
          <div
            className={`p-5 rounded-xl border ${
              prediction?.risk_tier === "High"
                ? "bg-rose-950/20 border-rose-500/40"
                : prediction?.risk_tier === "Medium"
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-emerald-950/20 border-emerald-500/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon
                  className={`w-5 h-5 ${
                    prediction?.risk_tier === "High"
                      ? "text-rose-400"
                      : prediction?.risk_tier === "Medium"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                />
                <h3 className="font-bold text-white text-sm">
                  {currentSite?.name} Shortfall Early Warning
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${getRiskBadgeColor(
                  prediction?.risk_tier
                )}`}
              >
                {prediction?.risk_tier || "Medium"} Risk Tier
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#0B0F17]/70 p-3 rounded-lg border border-[#1E293B]">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Planned Target</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {prediction ? prediction.target_tonnes : 1250} T
                </div>
              </div>
              <div className="bg-[#0B0F17]/70 p-3 rounded-lg border border-[#1E293B]">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Predicted Actual</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  {prediction ? prediction.predicted_actual_tonnes : 1080} T
                </div>
              </div>
              <div className="bg-[#0B0F17]/70 p-3 rounded-lg border border-[#1E293B]">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Projected Shortfall</div>
                <div
                  className={`text-base font-black font-mono mt-0.5 ${
                    (prediction?.predicted_shortfall_pct || 0) > 15
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {prediction ? prediction.predicted_shortfall_pct : 13.6}%
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-300 flex items-center justify-between pt-3 border-t border-[#1E293B]">
              <span>Primary Risk Driver:</span>
              <strong className="text-amber-400 font-mono">
                {prediction?.primary_risk_driver || "Equipment Mechanical Downtime"}
              </strong>
            </div>
          </div>

          {/* Contributing Risk Drivers Breakdown */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Shortfall Driver Attribution (Model Rationale)</span>
              </h3>
              <span className="text-[10px] text-gray-400">RandomForest Gini Weights</span>
            </div>

            <div className="space-y-2">
              {prediction?.risk_breakdown.map((item) => (
                <div key={item.driver} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="font-mono text-amber-400 font-semibold">{item.impact_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0B0F17] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, item.impact_pct * 2.8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Shortfall Simulator (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Operational Sensitivity Simulator</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Simulate mechanical or weather disruptions to test live model output.
              </p>
            </div>
            <button
              onClick={runShortfallPredict}
              disabled={isPredicting}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-all shadow flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPredicting ? "Computing..." : "Run Inference"}</span>
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {/* Target Tonnes */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Planned Daily Target Output</span>
                <span className="font-mono text-white font-bold">{targetTonnes} Tonnes</span>
              </div>
              <input
                type="range"
                min={500}
                max={1500}
                step={50}
                value={targetTonnes}
                onChange={(e) => setTargetTonnes(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Equipment Downtime Hours */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Fleet Downtime Hours</span>
                <span className="font-mono text-rose-400 font-bold">{downtimeHours} hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={36}
                step={0.5}
                value={downtimeHours}
                onChange={(e) => setDowntimeHours(Number(e.target.value))}
                className="w-full accent-rose-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rainfall mm */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Rainfall (Monsoon Precipitation)</span>
                <span className="font-mono text-cyan-400 font-bold">{rainfallMm} mm</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={2}
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Blasting Delay */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Blasting Clearance Delay</span>
                <span className="font-mono text-amber-400 font-bold">{blastingDelay} hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={blastingDelay}
                onChange={(e) => setBlastingDelay(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Labor Attendance */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Shift Labor Attendance</span>
                <span className="font-mono text-emerald-400 font-bold">{laborAttendance}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={100}
                step={1}
                value={laborAttendance}
                onChange={(e) => setLaborAttendance(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
