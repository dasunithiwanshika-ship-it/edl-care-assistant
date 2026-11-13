"use client";

import React, { useState } from "react";
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
  Activity
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { MOCK_OUTAGE_RECORDS } from "@/data/mockData";
import { OutageRecord } from "@/types";

export const OutageMapViewer: React.FC = () => {
  const { t, setReportModalOpen } = useApp();
  const [filterType, setFilterType] = useState<"all" | "planned" | "breakdown">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutage, setSelectedOutage] = useState<OutageRecord | null>(MOCK_OUTAGE_RECORDS[0]);
  const [mapLayer, setMapLayer] = useState<"standard" | "grid" | "satellite">("grid");

  // Filtering logic
  const filteredOutages = MOCK_OUTAGE_RECORDS.filter((outage) => {
    const matchesType = filterType === "all" || outage.type === filterType;
    const matchesSearch = 
      outage.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.feederName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outage.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const plannedCount = MOCK_OUTAGE_RECORDS.filter(o => o.type === "planned").length;
  const breakdownCount = MOCK_OUTAGE_RECORDS.filter(o => o.type === "breakdown").length;

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
              {t.outageMapPage.subtitle}
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
              {t.outageMapPage.filterAll} ({MOCK_OUTAGE_RECORDS.length})
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
        {/* Left: Map Canvas & Topology Simulation */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] shadow-card overflow-hidden flex flex-col h-[560px] relative">
          {/* Map Top Controls Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-md">
            <button
              onClick={() => setMapLayer("grid")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mapLayer === "grid"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Grid Topology
            </button>
            <button
              onClick={() => setMapLayer("standard")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mapLayer === "standard"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              OpenStreetMap
            </button>
            <button
              onClick={() => setMapLayer("satellite")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mapLayer === "satellite"
                  ? "bg-brand-maroon text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Map Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-md p-1 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-md">
            <button 
              onClick={() => alert("Zoom in simulated (prepared for Leaflet map.zoomIn())")}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert("Zoom out simulated (prepared for Leaflet map.zoomOut())")}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Map Visualizer Canvas */}
          <div className="flex-1 w-full h-full bg-[#EBF0F5] dark:bg-[#0E1318] relative overflow-hidden flex items-center justify-center p-6 select-none">
            {/* Grid Pattern Background */}
            <div 
              className="absolute inset-0 opacity-40 dark:opacity-20"
              style={{
                backgroundImage: "radial-gradient(#7A1428 1px, transparent 1px), radial-gradient(#F5C518 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                backgroundPosition: "0 0, 16px 16px",
              }}
            />

            {/* Stylized Island of Sri Lanka Outline / SVG */}
            <svg 
              className="w-full h-full max-h-[480px] drop-shadow-xl" 
              viewBox="0 0 600 700" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Island Shape */}
              <path
                d="M 280,60 C 310,80 340,120 360,180 C 380,240 395,310 380,380 C 365,450 340,510 310,580 C 290,620 260,650 240,650 C 220,650 200,610 190,560 C 180,510 180,450 195,380 C 210,310 220,240 235,160 C 250,90 265,50 280,60 Z"
                className="fill-white/80 dark:fill-[#151C24] stroke-brand-maroon/30 dark:stroke-brand-gold/30 stroke-2"
              />

              {/* Grid Feeders & Transmission lines */}
              <path
                d="M 280,180 L 250,330 L 220,440 L 290,460 L 250,560"
                className="stroke-brand-gold/40 dark:stroke-brand-gold/60 stroke-[2] stroke-dasharray-[4,4]"
              />
              <path
                d="M 250,330 L 320,350 L 340,430 L 290,460"
                className="stroke-brand-gold/40 dark:stroke-brand-gold/60 stroke-[2] stroke-dasharray-[4,4]"
              />

              {/* Substation Hub Nodes */}
              <circle cx="280" cy="180" r="4" className="fill-brand-gold" />
              <circle cx="250" cy="330" r="4" className="fill-brand-gold" />
              <circle cx="320" cy="350" r="4" className="fill-brand-gold" />
              <circle cx="220" cy="440" r="4" className="fill-brand-gold" />
              <circle cx="290" cy="460" r="4" className="fill-brand-gold" />
              <circle cx="250" cy="560" r="4" className="fill-brand-gold" />

              {/* Geographic Labels */}
              <text x="290" y="180" className="fill-gray-500 text-[10px] font-sans">Anuradhapura</text>
              <text x="330" y="355" className="fill-gray-500 text-[10px] font-sans">Kandy Primary</text>
              <text x="140" y="445" className="fill-gray-500 text-[10px] font-sans font-bold">Colombo Metro</text>
              <text x="260" y="575" className="fill-gray-500 text-[10px] font-sans">Galle Substation</text>
            </svg>

            {/* Interactive Outage Pin Markers */}
            {filteredOutages.map((outage) => {
              // Simulated map pixel offsets for demo markers
              let top = "50%";
              let left = "50%";
              if (outage.id === "OUT-2026-1089") { // Colombo 05 Havelock
                top = "62%";
                left = "38%";
              } else if (outage.id === "OUT-2026-1090") { // Kandy
                top = "52%";
                left = "54%";
              } else if (outage.id === "OUT-2026-1091") { // Galle
                top = "79%";
                left = "42%";
              } else if (outage.id === "OUT-2026-1092") { // Ja-Ela
                top = "57%";
                left = "37%";
              } else if (outage.id === "OUT-2026-1093") { // Battaramulla
                top = "63%";
                left = "41%";
              }

              const isSelected = selectedOutage?.id === outage.id;
              const isBreakdown = outage.type === "breakdown";

              return (
                <div
                  key={outage.id}
                  style={{ top, left }}
                  onClick={() => setSelectedOutage(outage)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                >
                  {/* Outer pulse */}
                  <div 
                    className={`w-7 h-7 rounded-full absolute -top-1 -left-1 animate-ping opacity-75 ${
                      isBreakdown ? "bg-red-500" : "bg-amber-400"
                    }`} 
                  />

                  {/* Marker Pin */}
                  <div 
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                      isSelected ? "ring-4 ring-brand-gold scale-125" : ""
                    } ${
                      isBreakdown 
                        ? "bg-brand-maroon text-white" 
                        : "bg-amber-500 text-brand-darkMaroon"
                    }`}
                  >
                    {isBreakdown ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Marker Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-xl z-40 pointer-events-none">
                    <p className="font-bold">{outage.area}</p>
                    <p className="text-[10px] text-gray-300">{outage.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaflet/OpenStreetMap Integration Readiness Notice */}
          <div className="bg-white/95 dark:bg-[#161B22]/95 border-t border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-maroon dark:text-brand-gold shrink-0" />
              <span>{t.outageMapPage.interactiveNotice}</span>
            </span>
            <span className="font-mono text-[10px] text-gray-400">
              Center: 6.9271° N, 79.8612° E
            </span>
          </div>
        </div>

        {/* Right: Outage Cards List & Selected Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Outage Detail Card */}
          {selectedOutage && (
            <div className="rounded-2xl bg-white dark:bg-[#161B22] border-2 border-brand-maroon/40 dark:border-red-900/60 p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedOutage.type === "breakdown"
                    ? "bg-red-100 text-brand-maroon dark:bg-red-950/80 dark:text-red-300"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                }`}>
                  {selectedOutage.type === "breakdown" ? "Active Breakdown" : "Planned Maintenance"}
                </span>
                <span className="font-mono text-xs text-gray-400 font-bold">
                  {selectedOutage.id}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedOutage.area}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedOutage.district}, {selectedOutage.province}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs space-y-1.5 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Feeder:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedOutage.feederName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Affected Customers:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedOutage.affectedCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedOutage.startTime}</span>
                </div>
                <div className="flex justify-between text-brand-maroon dark:text-red-400 font-bold">
                  <span>Est. Restoration:</span>
                  <span>{selectedOutage.estimatedRestoration}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300 bg-red-50/50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                <span className="font-bold block text-brand-maroon dark:text-red-300 mb-0.5">Reported Cause:</span>
                {selectedOutage.reason}
              </div>
            </div>
          )}

          {/* Outage Feed List */}
          <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-4 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Recorded Grid Outages ({filteredOutages.length})
            </h4>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredOutages.map((outage) => (
                <div
                  key={outage.id}
                  onClick={() => setSelectedOutage(outage)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedOutage?.id === outage.id
                      ? "border-brand-maroon bg-red-50/60 dark:bg-red-950/40 shadow-xs"
                      : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {outage.area}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      outage.type === "breakdown"
                        ? "bg-red-100 dark:bg-red-950/80 text-brand-maroon dark:text-red-300"
                        : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300"
                    }`}>
                      {outage.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                    {outage.reason}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-gray-400">
                    <span>{outage.feederName}</span>
                    <span className="font-semibold text-brand-maroon dark:text-red-400">
                      Restores: {outage.estimatedRestoration.split(" ")[1]} {outage.estimatedRestoration.split(" ")[2]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="rounded-2xl bg-gray-50 dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-gray-900 dark:text-white">
              {t.outageMapPage.mapLegend}
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{t.outageMapPage.legendBreakdown}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{t.outageMapPage.legendPlanned}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-gold shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">National Grid Primary Substation Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
