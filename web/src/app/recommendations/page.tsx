"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Check,
  RotateCcw,
} from "lucide-react";
import { useSite } from "@/context/site-context";
import { getRecommendations } from "@/lib/api";
import { Recommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const { sites, selectedSite } = useSite();
  const currentSiteId = selectedSite === "all" ? "balaghat" : selectedSite;
  const currentSite = sites.find((s) => s.site_id === currentSiteId) || sites[0];

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    getRecommendations(currentSiteId)
      .then((data) => setRecommendations(data.recommendations))
      .catch((err) => console.warn(err));
  }, [currentSiteId]);

  const toggleActioned = (id: string) => {
    setActionedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = recommendations.filter((r) => {
    if (filterPriority === "all") return true;
    if (filterPriority === "actioned") return actionedIds.has(r.id);
    if (filterPriority === "pending") return !actionedIds.has(r.id);
    return r.priority.toLowerCase() === filterPriority.toLowerCase();
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Moderate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>AI-Driven Operational Corrective Actions</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Prescriptive Intelligence
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic action recommendations derived from ML risk drivers to mitigate projected shortfall at{" "}
            <span className="text-white font-semibold">{currentSite?.name}</span>.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-1.5 bg-[#111827] border border-[#1E293B] p-1 rounded-xl text-xs">
          {[
            { id: "all", label: "All Actions" },
            { id: "critical", label: "Critical" },
            { id: "moderate", label: "Moderate" },
            { id: "pending", label: "Pending" },
            { id: "actioned", label: "Actioned" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterPriority(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterPriority === f.id
                  ? "bg-amber-500 text-black font-semibold shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recoverable Tonnage Summary Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#161F32] to-[#111827] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                Total Shortfall Recovery Potential
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                +145 TPD Estimated
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Implementing pending recommendations can reclaim up to 68% of the projected shortfall at {currentSite?.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-center border-t sm:border-t-0 sm:border-l border-[#1E293B] pt-3 sm:pt-0 sm:pl-6">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Recommendations</div>
            <div className="text-xl font-black font-mono text-white mt-0.5">{recommendations.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Actioned</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{actionedIds.size}</div>
          </div>
        </div>
      </div>

      {/* Recommendation Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec) => {
          const isActioned = actionedIds.has(rec.id);

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isActioned
                  ? "bg-[#0E1524]/60 border-emerald-500/30 opacity-75"
                  : "bg-[#111827] border-[#1E293B] hover:border-amber-500/40 shadow-sm"
              }`}
            >
              <div>
                {/* Top Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-gray-400">{rec.id}</span>
                    <span className="text-xs font-semibold text-amber-400">• {rec.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getPriorityBadge(
                        rec.priority
                      )}`}
                    >
                      {rec.priority}
                    </span>
                    {isActioned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Actioned</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Issue Detected */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Issue Detected (ML Bottleneck)</span>
                  </div>
                  <p className="text-xs text-gray-300 bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B]">
                    {rec.issue_detected}
                  </p>
                </div>

                {/* 2. Recommended Action */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center space-x-1">
                    <Wrench className="w-3 h-3" />
                    <span>Recommended Corrective Action</span>
                  </div>
                  <p className="text-xs font-medium text-white bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B] leading-relaxed">
                    {rec.recommended_action}
                  </p>
                </div>

                {/* 3. Expected Impact */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Expected Production Recovery</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/50">
                    {rec.expected_impact}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer with Action Toggle */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-gray-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{rec.implementation_time}</span>
                </div>

                <button
                  onClick={() => toggleActioned(rec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isActioned
                      ? "bg-[#1E293B] text-gray-300 hover:bg-[#2A3B55]"
                      : "bg-amber-500 hover:bg-amber-600 text-black shadow"
                  }`}
                >
                  {isActioned ? (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Actioned</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
