"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import MineMap from "@/components/mine-map";
import { getOverviewAnalytics } from "@/lib/api";
import { useSite } from "@/context/site-context";
import { OverviewKPIs, MonthlyTrendItem } from "@/lib/types";
import Link from "next/link";

export default function OverviewPage() {
  const { sites, selectedSite, setSelectedSite } = useSite();
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);

  useEffect(() => {
    getOverviewAnalytics()
      .then((data) => {
        setKpis(data.kpis);
        setTrend(data.monthly_trend);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredSites =
    selectedSite === "all"
      ? sites
      : sites.filter((s) => s.site_id === selectedSite);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Executive Production & Reserve Overview</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              MOIL Central Operations
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time geospatial reserve modeling, telemetry analytics, and AI shortfall early-warning system.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/reserves"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#111827] hover:bg-[#161F30] border border-[#1E293B] text-gray-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Map Reserves</span>
          </Link>
          <Link
            href="/production"
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Forecasting Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Estimated Reserves */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-amber-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total In-Situ Reserves
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis ? kpis.total_reserves_mt.toFixed(1) : "487.7"}
            </span>
            <span className="text-xs text-amber-400 font-bold">Million Tonnes</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>500 exploration blocks verified</span>
          </div>
        </div>

        {/* KPI 2: Production vs Target */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-amber-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              30-Day Output vs Target
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis ? (kpis.month_production_tonnes / 1000).toFixed(1) : "109.8"}k
            </span>
            <span className="text-xs text-gray-400">/ {kpis ? (kpis.month_target_tonnes / 1000).toFixed(1) : "128.1"}k T</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-rose-400">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{kpis ? kpis.month_shortfall_pct : 14.3}% deficit below planned target</span>
          </div>
        </div>

        {/* KPI 3: Active Shortfall Alerts */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-rose-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              High-Risk Mine Alerts
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-400 font-mono tracking-tight">
              {kpis ? kpis.critical_risk_alerts : 1}
            </span>
            <span className="text-xs text-gray-400">Mines Critical</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-gray-400">
            <span>Dongri Buzurg & Balaghat monitored</span>
          </div>
        </div>

        {/* KPI 4: Fleet Uptime % */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mechanized Fleet Uptime
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {kpis ? kpis.fleet_uptime_pct : "90.3"}%
            </span>
            <span className="text-xs text-gray-400">Fleet Availability</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400">
            <span>70 units active across 5 sites</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Geospatial Mine Regional Surveillance</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Pins indicate active sites color-coded by ML shortfall risk. Click any pin to inspect.
              </p>
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-[#0B0F17] px-2 py-1 rounded border border-[#1E293B]">
              Central Manganese Belt
            </span>
          </div>

          <div className="h-[390px] w-full">
            <MineMap
              sites={filteredSites}
              selectedSiteId={selectedSite !== "all" ? selectedSite : undefined}
              onSelectSite={(id) => setSelectedSite(id)}
            />
          </div>
        </div>

        {/* Right Column: 12-Month Production Trend Chart (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>12-Month Production Trajectory</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Actual output vs Target vs GradientBoosted ML prediction (Tonnes)
              </p>
            </div>
          </div>

          <div className="h-[390px] w-full">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis
                    dataKey="year_month"
                    stroke="#64748B"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
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
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="target_tonnes"
                    name="Target Plan"
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    fill="none"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual_tonnes"
                    name="Actual Mined"
                    stroke="#10B981"
                    fill="url(#actualGrad)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_tonnes"
                    name="ML Forecast"
                    stroke="#F59E0B"
                    fill="url(#predGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Loading production time-series...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regional Mine Detail Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Mine Region Status
          </h2>
          <span className="text-xs text-gray-400">
            {sites.length} Active MOIL Sites Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sites.map((site) => {
            const isSelected = selectedSite === site.site_id;
            const riskBg =
              site.current_risk_tier === "High"
                ? "border-rose-500/40 bg-rose-950/10"
                : site.current_risk_tier === "Medium"
                ? "border-amber-500/40 bg-amber-950/10"
                : "border-emerald-500/40 bg-emerald-950/10";

            return (
              <div
                key={site.site_id}
                onClick={() => setSelectedSite(site.site_id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                  isSelected
                    ? "border-amber-400 ring-1 ring-amber-400/50 bg-[#161F32]"
                    : `${riskBg} hover:border-gray-500 bg-[#111827]`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{site.name}</h3>
                    <p className="text-[11px] text-gray-400">
                      {site.state} • {site.mine_type}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      site.current_risk_tier === "High"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : site.current_risk_tier === "Medium"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {site.current_risk_tier}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Grade Assay:</span>
                    <span className="text-amber-400 font-semibold">{site.avg_grade_pct}% Mn</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Target:</span>
                    <span className="text-white font-mono">{site.base_target_tpd} TPD</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shortfall:</span>
                    <span
                      className={`font-semibold ${
                        site.current_shortfall_pct > 12 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {site.current_shortfall_pct}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-amber-400 font-medium">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
