"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MineSite, ReserveBlock } from "@/lib/types";

// Dynamic wrapper to prevent Next.js SSR window errors with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface MineMapProps {
  sites: MineSite[];
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  blocks?: ReserveBlock[];
  activeOverlay?: "none" | "ndvi" | "moisture" | "gravity";
  onSelectBlock?: (block: ReserveBlock) => void;
}

export default function MineMap({
  sites,
  selectedSiteId,
  onSelectSite,
  blocks = [],
  activeOverlay = "none",
  onSelectBlock,
}: MineMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[380px] bg-[#070A10] rounded-xl flex items-center justify-center border border-[#1E293B]">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Initializing Geospatial View...</span>
        </div>
      </div>
    );
  }

  // Central India coordinate center
  const centerLat = 21.65;
  const centerLon = 79.75;
  const zoom = 8;

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case "High":
        return "#EF4444"; // red
      case "Medium":
        return "#F59E0B"; // amber
      default:
        return "#10B981"; // green
    }
  };

  const getOverlayColor = (block: ReserveBlock) => {
    if (activeOverlay === "ndvi") {
      // NDVI anomaly: negative = red/orange (stress), positive = green
      return block.ndvi_anomaly < -0.15 ? "#F97316" : "#22C55E";
    }
    if (activeOverlay === "moisture") {
      // High soil moisture = blue/cyan
      return block.soil_moisture_pct > 28 ? "#06B6D4" : "#EAB308";
    }
    if (activeOverlay === "gravity") {
      // High gravity anomaly = purple/magenta (dense ore)
      return block.gravity_anomaly_mgal > 10 ? "#A855F7" : "#3B82F6";
    }
    return "#F59E0B";
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-[#1E293B] relative shadow-lg">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={zoom}
        style={{ height: "100%", width: "100%", minHeight: "420px" }}
        className="z-10"
      >
        {/* CartoDB Dark Matter base tile */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Reserve Exploration Blocks (when active) */}
        {blocks.map((block) => {
          const color = getOverlayColor(block);
          return (
            <CircleMarker
              key={block.block_id}
              center={[block.lat, block.lon]}
              radius={6}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.75,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => onSelectBlock && onSelectBlock(block),
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-amber-400">{block.block_id}</div>
                  <div className="text-gray-300">Mine: {block.site_name}</div>
                  <div className="text-gray-400">Ore Grade: <span className="text-white font-semibold">{block.ore_grade_pct}% Mn</span></div>
                  <div className="text-gray-400">Est. Reserve: <span className="text-emerald-400 font-semibold">{block.estimated_reserve_tonnes.toLocaleString()} T</span></div>
                  <div className="text-gray-400">NDVI Anomaly: <span className="text-cyan-400">{block.ndvi_anomaly}</span></div>
                  <div className="text-gray-400">Gravity Anomaly: <span className="text-purple-400">+{block.gravity_anomaly_mgal} mGal</span></div>
                  <div className="text-gray-400">Confidence: <span className="text-amber-300">{block.confidence_pct}%</span></div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Mine Site Pins */}
        {sites.map((site) => {
          const isSelected = selectedSiteId === site.site_id;
          const riskColor = getRiskColor(site.current_risk_tier);

          return (
            <CircleMarker
              key={site.site_id}
              center={[site.lat, site.lon]}
              radius={isSelected ? 14 : 10}
              pathOptions={{
                color: isSelected ? "#FFFFFF" : riskColor,
                fillColor: riskColor,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectSite && onSelectSite(site.site_id),
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1.5 min-w-[180px]">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-1">
                    <span className="font-bold text-white">{site.name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${riskColor}22`,
                        color: riskColor,
                        border: `1px solid ${riskColor}55`,
                      }}
                    >
                      {site.current_risk_tier} Risk
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Type: <span className="text-gray-200">{site.mine_type}</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Avg Grade: <span className="text-amber-400 font-semibold">{site.avg_grade_pct}% Mn</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Target: <span className="text-gray-200">{site.base_target_tpd} TPD</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Shortfall: <span className="text-rose-400 font-semibold">{site.current_shortfall_pct}%</span>
                  </div>
                  <div className="pt-1 text-[10px] text-gray-400 italic">
                    {site.active_alert}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend Floating Tag */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#0B0F17]/90 backdrop-blur border border-[#1E293B] rounded-lg p-2.5 text-[11px] space-y-1 shadow-lg pointer-events-none">
        <div className="font-semibold text-gray-300 text-[10px] uppercase tracking-wider mb-1">
          {activeOverlay !== "none" ? `Active Layer: ${activeOverlay.toUpperCase()}` : "Mine Risk Status"}
        </div>
        {activeOverlay === "none" ? (
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-300">Low</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-gray-300">Medium</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-gray-300">High Risk</span>
            </span>
          </div>
        ) : (
          <div className="text-gray-400 text-[10px]">
            {activeOverlay === "ndvi" && "Green = Normal Vegetation | Orange = Soil Canopy Stress Anomaly"}
            {activeOverlay === "moisture" && "Cyan = High Moisture Saturation | Yellow = Dry Bedrock"}
            {activeOverlay === "gravity" && "Purple = High Density Bouguer Ore Anomaly (>10 mGal)"}
          </div>
        )}
      </div>
    </div>
  );
}
