"use client";

import React from "react";
import { useApp } from "@/components/AppContext";
import { EDLCarePortalView } from "@/features/portal/EDLCarePortalView";
import { AccountSummaryCard } from "@/features/dashboard/AccountSummaryCard";
import { MonthlyUsageCard } from "@/features/dashboard/MonthlyUsageCard";
import { PowerOutageCard } from "@/features/dashboard/PowerOutageCard";
import { QuickServicesGrid } from "@/features/dashboard/QuickServicesGrid";
import { Leaf, ArrowLeft, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const { activeView, setActiveView } = useApp();

  return (
    <div className="space-y-6">
      {activeView === "portal" ? (
        // Exact EDLCare Web Portal replica (matching https://edlcare.edl.lk/)
        <EDLCarePortalView />
      ) : (
        // Authenticated Customer Dashboard View
        <div className="space-y-6 animate-fadeIn">
          {/* Top navigation back to portal */}
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={() => setActiveView("portal")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6c002c] dark:text-[#f87171] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to EDLCare Portal Home</span>
            </button>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Customer Session Active
            </span>
          </div>

          {/* Account Summary Card */}
          <section aria-label="Customer Account Summary">
            <AccountSummaryCard />
          </section>

          {/* Middle Row: Monthly Electricity Usage Chart & Power Outage Card */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <MonthlyUsageCard />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <PowerOutageCard />
            </div>
          </section>

          {/* Quick Services Section */}
          <section aria-label="Quick Customer Services">
            <QuickServicesGrid />
          </section>

          {/* Green Energy Tip Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#F8BB15]/10 border border-emerald-200 dark:border-emerald-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Green Energy & Solar Net-Metering Initiative
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Shift heavy electricity loads to off-peak slots (10:30 PM – 05:30 AM) to optimize grid balance.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert("Solar Net-Metering Feasibility Portal (Demo)")}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#009966] hover:bg-[#008055] text-white font-bold text-xs shadow-sm transition-colors"
            >
              Explore Green Tariffs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
