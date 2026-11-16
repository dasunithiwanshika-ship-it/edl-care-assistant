"use client";

import React, { useState, useEffect } from "react";
import { X, Sun, Search, CheckCircle2, AlertTriangle, BatteryCharging, Loader2 } from "lucide-react";
import { api } from "@/services/api";

interface SolarCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolarCapacityModal: React.FC<SolarCapacityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [transformerCode, setTransformerCode] = useState("TR-402");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    transformer_code: "TR-402",
    area: "Nugegoda / Havelock",
    feeder_name: "Feeder F-04 Havelock",
    total_capacity_kva: 160.0,
    used_capacity_kva: 88.0,
    remaining_capacity_kw: 42.0,
    status: "Capacity Available",
    is_available: true,
  });

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || transformerCode).trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSolarCapacity(code);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Transformer capacity query failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSearch("TR-402");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const usagePct = data ? Math.min(100, Math.round((data.used_capacity_kva / data.total_capacity_kva) * 100)) : 55;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#6c002c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#F8BB15]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Solar PV Capacity Availability
              </h3>
              <p className="text-xs text-red-200">
                Grid Substation & Transformer Capacity Check (API Verified)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Distribution Transformer Code (Demo: TR-402, TR-105, TR-780, TR-312)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={transformerCode}
                onChange={(e) => setTransformerCode(e.target.value)}
                placeholder="TR-402, TR-105, TR-780..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#6c002c] text-white text-xs font-bold hover:bg-[#550022] flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Quick Transformer Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {["TR-402", "TR-105", "TR-780", "TR-312", "TR-550"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => { setTransformerCode(code); handleSearch(code); }}
                className={`px-2 py-1 rounded-lg border font-mono font-bold ${
                  transformerCode === code
                    ? "bg-[#6c002c] text-white border-[#6c002c]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Capacity Stats Card */}
          {data && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">
                    {data.transformer_code} ({data.area})
                  </span>
                  <span className="text-[10px] text-slate-500">{data.feeder_name} • {data.total_capacity_kva} kVA Rated</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.is_available 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}>
                  {data.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Connected Solar Capacity:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{data.used_capacity_kva} kVA ({usagePct}%)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usagePct > 80 ? "bg-red-500" : usagePct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500">Available Hosting Headroom:</span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {data.remaining_capacity_kw} kW Remaining
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
