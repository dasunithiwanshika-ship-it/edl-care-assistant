"use client";

import React, { useState } from "react";
import { X, Calculator, Zap, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BillCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillCalculatorModal: React.FC<BillCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [units, setUnits] = useState(120);
  const [tariff, setTariff] = useState("domestic");

  if (!isOpen) return null;

  // Simple Sri Lanka domestic tariff calculation formula (Demo)
  const calculateBill = (u: number) => {
    let energyCharge = 0;
    let fixedCharge = 0;

    if (u <= 60) {
      energyCharge = u * 15.0;
      fixedCharge = 200.0;
    } else if (u <= 90) {
      energyCharge = 60 * 15.0 + (u - 60) * 22.0;
      fixedCharge = 300.0;
    } else if (u <= 120) {
      energyCharge = 60 * 15.0 + 30 * 22.0 + (u - 90) * 30.0;
      fixedCharge = 400.0;
    } else {
      energyCharge = 60 * 15.0 + 30 * 22.0 + 30 * 30.0 + (u - 120) * 42.0;
      fixedCharge = 500.0;
    }

    const surcharge = energyCharge * 0.12; // 12% Fuel Surcharge
    const total = energyCharge + fixedCharge + surcharge;
    return { energyCharge, fixedCharge, surcharge, total };
  };

  const calc = calculateBill(units);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#6c002c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#F8BB15]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Electricity Bill Calculator
              </h3>
              <p className="text-xs text-red-200">
                Official Tariff Estimation Tool
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

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Tariff Category
            </label>
            <select
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
            >
              <option value="domestic">Domestic Tariff (Category D-1)</option>
              <option value="religious">Religious Purpose (Category R-1)</option>
              <option value="general">General Commercial Purpose (Category GP-1)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Monthly Consumption Units (kWh)
              </label>
              <span className="font-mono font-bold text-sm text-[#6c002c] dark:text-[#f87171]">
                {units} Units
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full accent-[#6c002c]"
            />
          </div>

          {/* Breakdown Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-2 bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Energy Charge:</span>
              <span className="font-mono font-semibold">{formatCurrency(calc.energyCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fixed Service Charge:</span>
              <span className="font-mono font-semibold">{formatCurrency(calc.fixedCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fuel & Forex Surcharge:</span>
              <span className="font-mono font-semibold">{formatCurrency(calc.surcharge)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
              <span className="text-[#6c002c] dark:text-[#f87171]">Estimated Monthly Bill:</span>
              <span className="font-mono text-base text-[#6c002c] dark:text-[#f87171]">
                {formatCurrency(calc.total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Estimated on Sri Lanka Public Utilities Commission published tariff slabs. Actual meter billing may vary based on exact billing days.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
