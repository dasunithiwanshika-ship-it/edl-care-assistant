"use client";

import React from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  MapPin, 
  Send, 
  Activity, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  PhoneCall
} from "lucide-react";
import { useApp } from "@/components/AppContext";

export const PowerOutageCard: React.FC = () => {
  const { t, setReportModalOpen } = useApp();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-white to-red-50/40 dark:from-[#161B22] dark:via-[#161B22] dark:to-red-950/20 border border-red-200/60 dark:border-red-900/40 shadow-card hover:shadow-cardHover transition-all p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header with Alert Tag */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-[#27313B]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-red-300 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-5 h-5 text-brand-maroon dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {t.outageCard.title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                24/7 Grid Incident Monitoring
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Live Incident
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
          {t.outageCard.description}
        </p>

        {/* Live Feeder Status Notice */}
        <div className="my-4 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 space-y-2">
          <div className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-brand-maroon dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-brand-maroon dark:text-red-300">
                Nearby Alert: Havelock F-04 Feeder
              </p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-0.5">
                Technical breakdown affecting 340 premises. Restoration crew deployed. Estimated finish: <strong>02:30 PM</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-100 dark:border-[#27313B]">
        <button
          onClick={() => setReportModalOpen(true)}
          className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-maroon-gradient text-white text-xs sm:text-sm font-bold hover:opacity-95 shadow-md shadow-red-950/20 transition-all flex items-center justify-center gap-2 group"
        >
          <Send className="w-3.5 h-3.5 text-brand-gold group-hover:translate-x-0.5 transition-transform" />
          <span>{t.outageCard.reportNow}</span>
        </button>

        <Link
          href="/outages"
          className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-brand-maroon/30 dark:border-red-900/60 text-brand-maroon dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.outageCard.viewMap}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
