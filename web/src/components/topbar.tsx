"use client";

import { useState, useEffect } from "react";
import {
  Satellite,
  Clock,
  Info,
  ChevronDown,
  Building2,
  RefreshCw,
} from "lucide-react";
import ModelInfoModal from "./model-info-modal";

interface TopbarProps {
  selectedSite: string;
  onSiteChange: (siteId: string) => void;
}

const SITES_LIST = [
  { id: "all", name: "All Mine Regions (Consolidated)" },
  { id: "balaghat", name: "Balaghat Mine (MP - Underground)" },
  { id: "dongri_buzurg", name: "Dongri Buzurg Mine (MH - Opencast)" },
  { id: "gumgaon", name: "Gumgaon Mine (MH - Underground)" },
  { id: "mansar", name: "Mansar Mine (MH - Mixed)" },
  { id: "ukwa", name: "Ukwa Mine (MP - Underground)" },
];

export default function Topbar({ selectedSite, onSiteChange }: TopbarProps) {
  const [showModelModal, setShowModelModal] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) +
          " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <>
      <header className="h-16 bg-[#0B0F17]/90 backdrop-blur border-b border-[#1E293B] px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Site Selector & Organization Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-gray-200">MOIL LTD</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">Central Manganese Division</span>
          </div>

          <div className="relative">
            <select
              value={selectedSite}
              onChange={(e) => onSiteChange(e.target.value)}
              className="bg-[#111827] border border-[#1E293B] hover:border-amber-500/50 text-white text-xs font-medium rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
            >
              {SITES_LIST.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Live Sync Badge, Timestamp & AI Info Button */}
        <div className="flex items-center space-x-4">
          {/* Satellite Telemetry Sync Indicator */}
          <button
            onClick={handleSync}
            title="Click to force-sync satellite telemetry"
            className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#0F172A] border border-[#1E293B] hover:border-cyan-800 text-cyan-400 text-xs transition-colors"
          >
            <Satellite className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline font-mono text-[11px]">ISRO Bhuvan: Sync OK</span>
            <RefreshCw className={`w-3 h-3 text-gray-400 ml-1 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Clock */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{currentTime || "13 Sep 2026 • Live"}</span>
          </div>

          {/* Model Info Modal Trigger (Crucial for Pitch) */}
          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Architecture & Metrics</span>
          </button>
        </div>
      </header>

      {/* Model Info Modal */}
      {showModelModal && <ModelInfoModal onClose={() => setShowModelModal(false)} />}
    </>
  );
}
