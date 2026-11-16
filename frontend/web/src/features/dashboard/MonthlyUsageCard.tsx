"use client";

import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Zap, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { useApp } from "@/components/AppContext";
import { MOCK_CONSUMPTION_DATA } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";

export const MonthlyUsageCard: React.FC = () => {
  const { t, theme, consumptionData } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <div 
      id="consumption-chart"
      className="rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] shadow-card hover:shadow-cardHover transition-all p-5 sm:p-6 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#27313B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-brand-maroon dark:text-brand-gold flex items-center justify-center shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              {t.usageCard.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.usageCard.subtitle}
            </p>
          </div>
        </div>

        {/* Average Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs">
          <span className="text-gray-500 dark:text-gray-400">6-Mo Avg:</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">138 kWh</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
            +8.4%
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={consumptionData && consumptionData.length > 0 ? consumptionData : MOCK_CONSUMPTION_DATA}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="maroonUsageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A1428" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5C0D1D" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? "#27313B" : "#E5E7EB"} 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={isDark ? "#8B949E" : "#6B7280"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={isDark ? "#8B949E" : "#6B7280"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit=" kWh"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-white dark:bg-[#1a212b] p-3 shadow-dropdown border border-gray-200 dark:border-gray-700 text-xs">
                        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1 mb-1.5">
                          {label} 2026
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500 dark:text-gray-400">Consumption:</span>
                            <span className="font-mono font-bold text-brand-maroon dark:text-brand-gold">
                              {data.kwh} kWh
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500 dark:text-gray-400">Billed:</span>
                            <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                              {formatCurrency(data.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="kwh"
                stroke="#7A1428"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#maroonUsageGradient)"
                activeDot={{
                  r: 6,
                  fill: "#F5C518",
                  stroke: "#7A1428",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Loading consumption graph...
          </div>
        )}
      </div>

      {/* Footer / Trend Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-[#27313B] text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
          <span>Peak usage: <strong>154 kWh</strong> in October</span>
        </div>
        <span className="text-[11px] text-gray-400">
          Estimated tariff: Rs. 31.49 / unit average
        </span>
      </div>
    </div>
  );
};
