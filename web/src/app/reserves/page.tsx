"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Sliders,
  HelpCircle,
  Satellite,
  Compass,
  Zap,
} from "lucide-react";
import MineMap from "@/components/mine-map";
import { getReserveBlocks, predictReserve } from "@/lib/api";
import { useSite } from "@/context/site-context";
import { ReserveBlock, ReservePredictResponse } from "@/lib/types";

export default function ReservesPage() {
  const { sites, selectedSite, setSelectedSite } = useSite();
  const [blocks, setBlocks] = useState<ReserveBlock[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<"none" | "ndvi" | "moisture" | "gravity">("ndvi");
  const [selectedBlock, setSelectedBlock] = useState<ReserveBlock | null>(null);

  // Simulation Sliders for What-If Estimation
  const [depthM, setDepthM] = useState<number>(240);
  const [oreGradePct, setOreGradePct] = useState<number>(44.5);
  const [gravityAnomaly, setGravityAnomaly] = useState<number>(11.5);
  const [ndviAnomaly, setNdviAnomaly] = useState<number>(-0.18);
  const [soilMoisture, setSoilMoisture] = useState<number>(24.0);

  // Prediction Response
  const [prediction, setPrediction] = useState<ReservePredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    getReserveBlocks(selectedSite !== "all" ? selectedSite : undefined)
      .then((data) => {
        setBlocks(data);
        if (data.length > 0) {
          setSelectedBlock(data[0]);
          setDepthM(data[0].depth_m);
          setOreGradePct(data[0].ore_grade_pct);
          setGravityAnomaly(data[0].gravity_anomaly_mgal);
          setNdviAnomaly(data[0].ndvi_anomaly);
          setSoilMoisture(data[0].soil_moisture_pct);
        }
      })
      .catch((err) => console.warn(err));
  }, [selectedSite]);

  const runPrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await predictReserve({
        site_id: selectedSite !== "all" ? selectedSite : "balaghat",
        depth_m: depthM,
        ore_grade_pct: oreGradePct,
        gravity_anomaly_mgal: gravityAnomaly,
        ndvi_anomaly: ndviAnomaly,
        soil_moisture_pct: soilMoisture,
      });
      setTimeout(() => {
        setPrediction(res);
        setIsPredicting(false);
      }, 350);
    } catch (err) {
      console.error(err);
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    if (selectedBlock) {
      runPrediction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlock]);

  const handleBlockSelect = (block: ReserveBlock) => {
    setSelectedBlock(block);
    setDepthM(block.depth_m);
    setOreGradePct(block.ore_grade_pct);
    setGravityAnomaly(block.gravity_anomaly_mgal);
    setNdviAnomaly(block.ndvi_anomaly);
    setSoilMoisture(block.soil_moisture_pct);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Geological & Satellite Reserve Mapping</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ISRO / GSI Space-Tech
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Multispectral satellite anomalies (NDVI, soil moisture, gravity) fused with sub-surface assay logs to identify prospective manganese lodes.
          </p>
        </div>

        {/* Overlay Selector Controls */}
        <div className="flex items-center space-x-1.5 bg-[#111827] border border-[#1E293B] p-1 rounded-xl">
          <button
            onClick={() => setActiveOverlay("ndvi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeOverlay === "ndvi"
                ? "bg-amber-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>NDVI Anomaly</span>
          </button>
          <button
            onClick={() => setActiveOverlay("moisture")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeOverlay === "moisture"
                ? "bg-cyan-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>Soil Moisture</span>
          </button>
          <button
            onClick={() => setActiveOverlay("gravity")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeOverlay === "gravity"
                ? "bg-purple-500 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>Bouguer Gravity</span>
          </button>
          <button
            onClick={() => setActiveOverlay("none")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeOverlay === "none"
                ? "bg-gray-700 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>Standard</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Map + Side Explainability Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                Exploration Grid ({blocks.length} Geological Blocks)
              </h2>
            </div>
            <div className="text-[11px] text-gray-400">
              Click any circle block to load telemetry
            </div>
          </div>

          <div className="h-[460px] w-full">
            <MineMap
              sites={sites}
              selectedSiteId={selectedSite !== "all" ? selectedSite : undefined}
              onSelectSite={setSelectedSite}
              blocks={blocks}
              activeOverlay={activeOverlay}
              onSelectBlock={handleBlockSelect}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-gray-400">
            <span>
              Active Block:{" "}
              <strong className="text-amber-400 font-mono">
                {selectedBlock ? selectedBlock.block_id : "Selecting..."}
              </strong>
            </span>
            <span>
              Mine Region: <span className="text-white">{selectedBlock?.site_name || "Balaghat"}</span>
            </span>
            <span>
              Assay Grade: <span className="text-emerald-400 font-semibold">{selectedBlock?.ore_grade_pct || 44.5}% Mn</span>
            </span>
          </div>
        </div>

        {/* Right Side: What-If Simulator & Model Explainability (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prediction Result & Confidence Meter */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-[#161F32] to-[#111827] border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Reserve Inference (GradientBoosting)</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                Confidence: {prediction?.confidence_pct || 91.2}%
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold">Predicted In-Situ Reserve</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl font-black font-mono text-white">
                    {isPredicting
                      ? "Calculating..."
                      : prediction
                      ? (prediction.predicted_reserve_tonnes / 1000).toLocaleString() + "k"
                      : "1,875k"}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">Tonnes Ore</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-gray-400 uppercase font-semibold">Equivalent MT</p>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {prediction ? prediction.predicted_reserve_mt : "1.875"} MT
                </span>
              </div>
            </div>

            {/* Explainability Feature Importance Breakdown */}
            <div className="mt-5 pt-4 border-t border-[#1E293B] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Why this Estimate? (Trained Feature Weights)</span>
                </span>
                <span className="text-[10px] text-gray-400">scikit-learn real importances</span>
              </div>

              {prediction?.top_contributing_factors.map((factor) => (
                <div key={factor.feature} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-300">{factor.label}</span>
                    <span className="font-mono text-amber-400 font-semibold">{factor.weight_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0B0F17] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                      style={{ width: `${Math.min(100, factor.weight_pct * 1.3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Sliders */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Geological & Satellite Parameter Tuning</span>
              </h3>
              <button
                onClick={runPrediction}
                disabled={isPredicting}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] rounded transition-all shadow-sm flex items-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>{isPredicting ? "Computing..." : "Recalculate"}</span>
              </button>
            </div>

            {/* Slider 1: Depth Profile */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Drill Hole Depth</span>
                <span className="font-mono text-white font-bold">{depthM} m</span>
              </div>
              <input
                type="range"
                min={50}
                max={420}
                value={depthM}
                onChange={(e) => setDepthM(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: Ore Grade % */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Manganese Grade Assay</span>
                <span className="font-mono text-amber-400 font-bold">{oreGradePct}% Mn</span>
              </div>
              <input
                type="range"
                min={30}
                max={50}
                step={0.5}
                value={oreGradePct}
                onChange={(e) => setOreGradePct(Number(e.target.value))}
                className="w-full accent-amber-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 3: Bouguer Gravity Anomaly */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Bouguer Gravity Anomaly</span>
                <span className="font-mono text-purple-400 font-bold">+{gravityAnomaly} mGal</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={20.0}
                step={0.5}
                value={gravityAnomaly}
                onChange={(e) => setGravityAnomaly(Number(e.target.value))}
                className="w-full accent-purple-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 4: NDVI Anomaly (Vegetation Stress) */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">NDVI Canopy Stress Anomaly</span>
                <span className="font-mono text-cyan-400 font-bold">{ndviAnomaly}</span>
              </div>
              <input
                type="range"
                min={-0.45}
                max={0.2}
                step={0.02}
                value={ndviAnomaly}
                onChange={(e) => setNdviAnomaly(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-[#0B0F17] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
