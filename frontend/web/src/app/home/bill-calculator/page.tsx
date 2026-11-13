"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Lightbulb, 
  Calendar as CalendarIcon, 
  Zap, 
  Info, 
  CheckCircle2, 
  RotateCcw 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BillCalculatorPage() {
  const [tariffCategory, setTariffCategory] = useState("Domestic");
  const [selfGen, setSelfGen] = useState("None");
  const [periodType, setPeriodType] = useState<"pick" | "days">("pick");
  const [days, setDays] = useState(30);
  const [lastDate, setLastDate] = useState("2026-10-01");
  const [currentDate, setCurrentDate] = useState("2026-10-31");
  const [unitMode, setUnitMode] = useState<"readings" | "units">("readings");
  const [prevReading, setPrevReading] = useState(14250);
  const [currReading, setCurrReading] = useState(14404);
  const [directUnits, setDirectUnits] = useState(154);
  const [considerUnread, setConsiderUnread] = useState(false);
  const [calcResult, setCalcResult] = useState<{
    units: number;
    energyCharge: number;
    fixedCharge: number;
    surcharge: number;
    total: number;
  } | null>(null);

  const calculatedUnits = unitMode === "readings" 
    ? Math.max(0, currReading - prevReading) 
    : directUnits;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const u = calculatedUnits;
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

    const surcharge = energyCharge * 0.12;
    const total = energyCharge + fixedCharge + surcharge;
    setCalcResult({ units: u, energyCharge, fixedCharge, surcharge, total });
  };

  const handleClear = () => {
    setPrevReading(0);
    setCurrReading(0);
    setDirectUnits(0);
    setCalcResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Title Header Card (Exact match to Screenshot 3) */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#6c002c] text-white flex items-center justify-center shadow-sm">
          <Calculator className="w-6 h-6 text-[#F8BB15]" />
        </div>
        <div>
          <h1 
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"
            style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
          >
            <span>Bill Calculator</span>
            <span className="text-xs text-slate-400 font-mono font-medium">V4.2</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimate your Electricity Bill by Tariff, Period, and Meter Readings/Units.
          </p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        {/* 3 Side-by-Side Cards (Exact match to Screenshot 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Tariff Card */}
          <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tariff
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select the correct tariff category
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tariff Category
              </label>
              <select
                value={tariffCategory}
                onChange={(e) => setTariffCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
              >
                <option value="Domestic">Domestic</option>
                <option value="Religious">Religious</option>
                <option value="Industrial">Industrial</option>
                <option value="General Purpose">General Purpose</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Self Generation Option
              </label>
              <select
                value={selfGen}
                onChange={(e) => setSelfGen(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
              >
                <option value="None">None</option>
                <option value="Net Metering">Net Metering</option>
                <option value="Net Accounting">Net Accounting</option>
                <option value="Net Plus">Net Plus</option>
              </select>
            </div>
          </div>

          {/* 2. Period Card */}
          <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Period
                </h3>
                <p className="text-[11px] text-slate-500">
                  Days
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="period"
                  checked={periodType === "pick"}
                  onChange={() => setPeriodType("pick")}
                  className="accent-[#6c002c]"
                />
                <span>Pick Days</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="period"
                  checked={periodType === "days"}
                  onChange={() => setPeriodType("days")}
                  className="accent-[#6c002c]"
                />
                <span>Number of Days</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Days
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Last reading date
                </label>
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Current reading date
                </label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* 3. Units / kWh Card */}
          <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Units /kWh
                </h3>
                <p className="text-[11px] text-slate-500">
                  Customer ← Grid
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="unitMode"
                  checked={unitMode === "readings"}
                  onChange={() => setUnitMode("readings")}
                  className="accent-[#6c002c]"
                />
                <span>Readings</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="unitMode"
                  checked={unitMode === "units"}
                  onChange={() => setUnitMode("units")}
                  className="accent-[#6c002c]"
                />
                <span>Number of Units</span>
              </label>
            </div>

            {unitMode === "readings" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Previous Meter Reading
                  </label>
                  <input
                    type="number"
                    value={prevReading}
                    onChange={(e) => setPrevReading(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Current Meter Reading
                  </label>
                  <input
                    type="number"
                    value={currReading}
                    onChange={(e) => setCurrReading(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Total Units / kWh
                </label>
                <input
                  type="number"
                  value={directUnits}
                  onChange={(e) => setDirectUnits(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Units /kWh
              </label>
              <input
                type="text"
                readOnly
                value={`${calculatedUnits} kWh (Import Units)`}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Row (Exact match to Screenshot 3) */}
        <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={considerUnread}
              onChange={(e) => setConsiderUnread(e.target.checked)}
              className="accent-[#6c002c] rounded"
            />
            <span>Consider previous reading(s) UNREAD</span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white text-xs font-bold shadow-sm transition-colors"
            >
              Calculate
            </button>
          </div>
        </div>
      </form>

      {/* Calculated Result Card */}
      {calcResult && (
        <div className="rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#6c002c]/40 dark:border-red-900/60 p-6 shadow-md space-y-4 animate-slideUp">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-slate-900 dark:text-white text-base">
              Calculation Breakdown ({calcResult.units} Units – {tariffCategory})
            </span>
            <span className="text-xl font-black font-mono text-[#6c002c] dark:text-[#f87171]">
              {formatCurrency(calcResult.total)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-400 block">Energy Charge:</span>
              <span className="font-mono font-bold text-sm">{formatCurrency(calcResult.energyCharge)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-400 block">Fixed Service Charge:</span>
              <span className="font-mono font-bold text-sm">{formatCurrency(calcResult.fixedCharge)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-400 block">Fuel Adjustment (12%):</span>
              <span className="font-mono font-bold text-sm">{formatCurrency(calcResult.surcharge)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
