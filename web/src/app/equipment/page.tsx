"use client";

import { useEffect, useState } from "react";
import {
  Thermometer,
  Gauge,
  Waves,
  Search,
} from "lucide-react";
import { useSite } from "@/context/site-context";
import { getEquipment } from "@/lib/api";
import { EquipmentUnit } from "@/lib/types";

export default function EquipmentPage() {
  const { selectedSite } = useSite();
  const [equipment, setEquipment] = useState<EquipmentUnit[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getEquipment(selectedSite !== "all" ? selectedSite : undefined)
      .then((data) => setEquipment(data))
      .catch((err) => console.warn(err));
  }, [selectedSite]);

  const filtered = equipment.filter((eq) => {
    const matchesType =
      filterType === "all" ||
      eq.equipment_type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      eq.equipment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.model_make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.site_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Moderate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const criticalCount = equipment.filter((e) => e.failure_risk === "Critical").length;
  const avgUptime =
    equipment.length > 0
      ? (equipment.reduce((acc, curr) => acc + curr.uptime_pct, 0) / equipment.length).toFixed(1)
      : "91.2";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Heavy Machinery & Equipment Telematics</span>
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Predictive Maintenance
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time sensor telemetry, vibration profiles, and failure risk assessment across 70 MOIL mechanized mining assets.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center space-x-4 bg-[#111827] border border-[#1E293B] p-2 px-4 rounded-xl text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Active Fleet</span>
            <span className="text-white font-mono font-bold text-sm">{equipment.length} Units</span>
          </div>
          <div className="h-6 w-[1px] bg-[#1E293B]" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Average Uptime</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">{avgUptime}%</span>
          </div>
          <div className="h-6 w-[1px] bg-[#1E293B]" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Critical Watch</span>
            <span className="text-rose-400 font-mono font-bold text-sm">{criticalCount} Units</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#111827] border border-[#1E293B] p-3 rounded-xl">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, machine, or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto text-xs">
          {[
            { id: "all", label: "All Machinery" },
            { id: "excavator", label: "Excavators" },
            { id: "dumper", label: "Dumpers (60T)" },
            { id: "drill", label: "Drill Rigs" },
            { id: "crusher", label: "Crushers" },
            { id: "pump", label: "Dewatering Pumps" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                filterType === cat.id
                  ? "bg-amber-500 text-black font-semibold shadow"
                  : "text-gray-300 hover:text-white bg-[#0B0F17] border border-[#1E293B]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table / Grid */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F17] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="p-3.5 pl-5">Asset Tag & Type</th>
                <th className="p-3.5">Site Location</th>
                <th className="p-3.5">Status & Condition</th>
                <th className="p-3.5">Failure Risk Badge</th>
                <th className="p-3.5">Uptime %</th>
                <th className="p-3.5">Operating Hours</th>
                <th className="p-3.5">Telemetry (Hydraulic / Temp / Vib)</th>
                <th className="p-3.5 pr-5">Last Maintained</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-gray-300">
              {filtered.map((unit) => (
                <tr key={unit.equipment_id} className="hover:bg-[#161F32] transition-colors">
                  {/* Tag & Type */}
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-white font-mono">{unit.equipment_id}</div>
                    <div className="text-[11px] text-gray-400">{unit.equipment_type}</div>
                    <div className="text-[10px] text-gray-400">{unit.model_make}</div>
                  </td>

                  {/* Site */}
                  <td className="p-3.5">
                    <span className="font-medium text-gray-200">{unit.site_name}</span>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center space-x-1 font-medium ${
                        unit.status.includes("Required")
                          ? "text-rose-400"
                          : unit.status.includes("Watch")
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      <span>{unit.status}</span>
                    </span>
                  </td>

                  {/* Failure Risk Badge */}
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getRiskBadge(
                        unit.failure_risk
                      )}`}
                    >
                      {unit.failure_risk}
                    </span>
                  </td>

                  {/* Uptime % */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white">{unit.uptime_pct}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-[#0B0F17] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            unit.uptime_pct > 90
                              ? "bg-emerald-500"
                              : unit.uptime_pct > 80
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${unit.uptime_pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Operating Hours */}
                  <td className="p-3.5 font-mono text-gray-300">
                    {unit.total_operating_hours.toLocaleString()} hrs
                  </td>

                  {/* Telemetry Sensor Badges */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2 text-[11px] font-mono">
                      <span
                        title="Hydraulic Pressure"
                        className="px-1.5 py-0.5 rounded bg-[#0B0F17] border border-[#1E293B] text-cyan-400 flex items-center space-x-0.5"
                      >
                        <Gauge className="w-2.5 h-2.5 mr-0.5" />
                        <span>{unit.hydraulic_pressure_bar}b</span>
                      </span>
                      <span
                        title="Engine Oil Temperature"
                        className={`px-1.5 py-0.5 rounded bg-[#0B0F17] border border-[#1E293B] flex items-center space-x-0.5 ${
                          unit.engine_oil_temp_c > 94 ? "text-rose-400" : "text-amber-400"
                        }`}
                      >
                        <Thermometer className="w-2.5 h-2.5 mr-0.5" />
                        <span>{unit.engine_oil_temp_c}°C</span>
                      </span>
                      <span
                        title="Vibration RMS"
                        className={`px-1.5 py-0.5 rounded bg-[#0B0F17] border border-[#1E293B] flex items-center space-x-0.5 ${
                          unit.vibration_rms_mms > 5.0 ? "text-rose-400 font-bold" : "text-gray-300"
                        }`}
                      >
                        <Waves className="w-2.5 h-2.5 mr-0.5" />
                        <span>{unit.vibration_rms_mms}mm/s</span>
                      </span>
                    </div>
                  </td>

                  {/* Last Maintained */}
                  <td className="p-3.5 pr-5 text-gray-400 text-[11px]">
                    <div>{unit.last_maintenance_date}</div>
                    <div className="text-[10px] text-gray-400">({unit.days_since_maintenance}d ago)</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
