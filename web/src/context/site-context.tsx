"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MineSite } from "@/lib/types";
import { getSites } from "@/lib/api";

interface SiteContextType {
  selectedSite: string;
  setSelectedSite: (siteId: string) => void;
  sites: MineSite[];
  loading: boolean;
  refreshData: () => void;
}

const SiteContext = createContext<SiteContextType>({
  selectedSite: "all",
  setSelectedSite: () => {},
  sites: [],
  loading: true,
  refreshData: () => {},
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [sites, setSites] = useState<MineSite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSites = () => {
    setLoading(true);
    getSites()
      .then((data) => setSites(data))
      .catch((err) => console.warn("Failed to load sites:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        selectedSite,
        setSelectedSite,
        sites,
        loading,
        refreshData: loadSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
