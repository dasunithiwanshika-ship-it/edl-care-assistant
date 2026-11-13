"use client";

import React, { useState } from "react";
import { X, Sun, Search, CheckCircle2, AlertTriangle, ArrowRight, BatteryCharging } from "lucide-react";

interface SolarCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolarCapacityModal: React.FC<SolarCapacityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [transformerCode, setTransformerCode] = useState("TX-COL-05-42");
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

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
                Grid Substation & Transformer Capacity Check
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
              Distribution Transformer Code or Area
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={transformerCode}
                onChange={(e) => setTransformerCode(e.target.value)}
                placeholder="E.g., TX-COL-05-42 or Havelock..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
              />
              <button
                type="button"
                onClick={() => setSearched(true)}
                className="px-4 py-2 rounded-xl bg-[#6c002c] text-white text-xs font-bold hover:bg-[#550022] flex items-center gap-1 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Capacity Stats Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  TX-COL-05-42 (Havelock Primary)
                </span>
                <span className="text-[10px] text-slate-500">Colombo Area Substation • 100 kVA Rated</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Capacity Available
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Current Solar Connected:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">65 kVA (65%)</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "65%" }} />
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-500">Available Hosting Headroom:</span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">35 kVA Remaining</span>
              </div>
            </div>
          </div>

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
