"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  TrendingDown,
  Sparkles,
  Wrench,
  Compass,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Overview Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Reserve Mapping",
    href: "/reserves",
    icon: Layers,
    badge: "Space-Tech",
  },
  {
    name: "Production & Shortfall",
    href: "/production",
    icon: TrendingDown,
    badge: "ML Forecaster",
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    icon: Sparkles,
    badge: "AI Action",
  },
  {
    name: "Equipment Health",
    href: "/equipment",
    icon: Wrench,
    badge: null,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#070A10] border-r border-[#1E293B] flex flex-col shrink-0 h-screen select-none sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-lg tracking-wider">
            OS
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">OreSight</span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">MOIL Limited • SIH 26009</p>
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Core Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-gray-300 hover:text-white hover:bg-[#111827] border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-amber-400" : "text-gray-400 group-hover:text-gray-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-[#161F30] text-gray-400 border border-[#22314E]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Operations & Context
        </div>

        <div className="px-3 py-3 rounded-lg bg-[#0E1524] border border-[#1E293B] space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-gray-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-gray-200">5 Active Regions</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Central Indian Manganese Belt: Balaghat, Dongri Buzurg, Gumgaon, Mansar, Ukwa.
          </p>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1E293B] bg-[#070A10]">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-300">FastAPI ML Engine</span>
          </span>
          <span className="font-mono text-emerald-400">ONLINE</span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center justify-between">
          <span>ISRO Bhuvan Sync</span>
          <span className="text-gray-300 font-mono">10m Res</span>
        </div>
      </div>
    </aside>
  );
}
