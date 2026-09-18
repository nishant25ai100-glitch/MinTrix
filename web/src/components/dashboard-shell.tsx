"use client";

import React from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import { useSite } from "@/context/site-context";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { selectedSite, setSelectedSite } = useSite();

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-gray-100 antialiased selection:bg-amber-500 selection:text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar selectedSite={selectedSite} onSiteChange={setSelectedSite} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
