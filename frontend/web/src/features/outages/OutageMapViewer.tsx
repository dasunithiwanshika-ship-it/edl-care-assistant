"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Layers, 
  Compass, 
  RotateCcw, 
  Plus, 
  Minus, 
  Navigation,
  Info,
  Clock,
  Zap,
  CheckCircle2,
  Activity,
  Globe
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { MOCK_OUTAGE_RECORDS } from "@/data/mockData";
import { OutageRecord } from "@/types";

// Dynamically import LeafletMap with SSR disabled (Leaflet requires browser window)
const LeafletMap = dynamic(
  () => import("@/components/outages/LeafletMap").then((mod) => mod.LeafletMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#12161f] text-slate-400 gap-2">
        <Globe className="w-8 h-8 animate-spin text-brand-maroon dark:text-brand-gold" />
        <span className="text-xs font-semibold">Loading Sri Lanka OpenStreetMap...</span>
      </div>
    )
  }
);

export const OutageMapViewer: React.FC = () => {
  const { t, setReportModalOpen } = useApp();
  const [filterType, setFilterType] = useState<"all" | "planned" | "breakdown">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutage, setSelectedOutage] = useState<OutageRecord | null>(MOCK_OUTAGE_RECORDS[0]);
  const [mapLayer, setMapLayer] = useState<"standard" | "grid" | "satellite">("standard");
  const [outages, setOutages] = useState<OutageRecord[]>(MOCK_OUTAGE_RECORDS);

  // Attempt fetching live outages from FastAPI backend
  useEffect(() => {
    fetch("http://localhost:8000/api/outages")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Backend offline");
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: OutageRecord[] = data.map((d: any) => ({
            id: d.outage_code,
            area: d.area,
            district: d.district,
            province: d.district === "Kandy" ? "Central" : d.district === "Galle" ? "Southern" : "Western",
            type: d.outage_type === "planned" ? "planned" : "breakdown",
            status: d.status === "In Progress" ? "active" : "scheduled",
            affectedCustomers: d.affected_customers,
            startTime: d.start_time,
            estimatedRestoration: d.estimated_restoration,
            reason: d.reason,
            feederName: d.feeder_name,
            coordinates: { lat: d.latitude, lng: d.longitude }
          }));
          setOutages(mapped);
          setSelectedOutage(mapped[0]);
        }
      })
      .catch(() => {
        // Fall back gracefully to mock data
      });
  }, []);

  // Filtering logic
  const filteredOutages = outages.filter((outage) => {
    const matchesType = filterType === "all" || outage.type === filterType;
    const matchesSearch = 
      outage.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.feederName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const plannedCount = outages.filter(o => o.type === "planned").length;
  const breakdownCount = outages.filter(o => o.type === "breakdown").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Header */}
      <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-5 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-brand-gold flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.outageMapPage.title}
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.outageMapPage.subtitle} • Interactive Leaflet & OpenStreetMap Engine
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-maroon-gradient text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-brand-gold" />
            <span>{t.outageMapPage.reportBreakdownBtn}</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-gray-100 dark:border-[#27313B]">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.outageMapPage.searchLocation}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            />
          </div>

          {/* Filter Buttons */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-maroon text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {t.outageMapPage.filterAll} ({outages.length})
            </button>
            <button
              onClick={() => setFilterType("planned")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "planned"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.outageMapPage.filterPlanned} ({plannedCount})</span>
            </button>
            <button
              onClick={() => setFilterType("breakdown")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "breakdown"
                  ? "bg-red-700 text-white shadow-sm"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.outageMapPage.filterBreakdown} ({breakdownCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewer & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] shadow-card overflow-hidden flex flex-col h-[580px] relative">
          {/* Map Top Controls Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-md">
            <button
              onClick={() => setMapLayer("standard")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                mapLayer === "standard"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>OpenStreetMap</span>
            </button>
            <button
              onClick={() => setMapLayer("satellite")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                mapLayer === "satellite"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapLayer("grid")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                mapLayer === "grid"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Grid Diagram</span>
            </button>
          </div>

          {/* Interactive Map Visualizer Canvas */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            {mapLayer !== "grid" ? (
              <LeafletMap
                outages={filteredOutages}
                selectedOutage={selectedOutage}
                onSelectOutage={(outage) => setSelectedOutage(outage)}
                mapLayer={mapLayer}
              />
            ) : (
              /* Fallback Grid Topology Vector Map */
              <div className="w-full h-full bg-[#EBF0F5] dark:bg-[#0E1318] flex items-center justify-center p-6 relative">
                <div 
                  className="absolute inset-0 opacity-40 dark:opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(#7A1428 1px, transparent 1px), radial-gradient(#F5C518 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    backgroundPosition: "0 0, 16px 16px",
                  }}
                />
                <div className="text-center z-10 space-y-2">
                  <Zap className="w-10 h-10 text-brand-gold mx-auto animate-pulse" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Grid Transmission Overlay</h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    High-voltage 132kV / 33kV backbone feeding Colombo Metro, Kandy Central, and Southern Substation rings.
                  </p>
                  <button 
                    onClick={() => setMapLayer("standard")}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-brand-maroon text-white text-xs font-semibold"
                  >
                    Switch back to Live Map
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Outage Incident Details & Active List */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-[580px]">
          {/* Selected Incident Card */}
          {selectedOutage ? (
            <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-4 shadow-card shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedOutage.type === "breakdown"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200"
                }`}>
                  {selectedOutage.type === "breakdown" ? "Active Breakdown" : "Planned Maintenance"}
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {selectedOutage.id}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {selectedOutage.area}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  District: {selectedOutage.district} ({selectedOutage.province} Province)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-[#27313B] text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Feeder Line</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                    {selectedOutage.feederName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Restoration ETA</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    {selectedOutage.estimatedRestoration}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#1F242C] p-2.5 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-gray-400 block font-semibold">Field Crew Dispatch</span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300">
                  {selectedOutage.reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-4 text-center text-xs text-gray-400">
              Select an outage pin on the map to inspect details
            </div>
          )}

          {/* Incident List */}
          <div className="flex-1 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-4 shadow-card overflow-y-auto space-y-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Outage Incidents ({filteredOutages.length})</span>
              <span className="text-[10px] text-gray-400 font-normal">Click to focus</span>
            </h4>
            {filteredOutages.map((outage) => (
              <div
                key={outage.id}
                onClick={() => setSelectedOutage(outage)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedOutage?.id === outage.id
                    ? "bg-brand-maroon/5 dark:bg-brand-gold/10 border-brand-maroon dark:border-brand-gold shadow-xs"
                    : "bg-gray-50 dark:bg-[#1a212b] border-gray-100 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-white truncate">
                    {outage.area}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    outage.type === "breakdown" 
                      ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" 
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}>
                    {outage.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{outage.feederName}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {outage.estimatedRestoration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
