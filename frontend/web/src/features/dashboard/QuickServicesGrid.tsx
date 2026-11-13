"use client";

import React from "react";
import Link from "next/link";
import { 
  Receipt, 
  MapPin, 
  AlertTriangle, 
  SunMedium, 
  ArrowUpRight, 
  CheckCircle,
  Zap
} from "lucide-react";
import { useApp } from "@/components/AppContext";

export const QuickServicesGrid: React.FC = () => {
  const { 
    t, 
    setBillModalOpen, 
    setReportModalOpen, 
    openChatWithQuery 
  } = useApp();

  const services = [
    {
      id: "view-bill",
      title: t.quickServices.viewBill,
      description: t.quickServices.viewBillDesc,
      icon: Receipt,
      badge: "October 2026",
      action: () => setBillModalOpen(true),
      color: "from-red-500/10 to-red-900/10 text-brand-maroon dark:text-red-400",
    },
    {
      id: "check-outage",
      title: t.quickServices.checkOutage,
      description: t.quickServices.checkOutageDesc,
      icon: MapPin,
      badge: "Live Monitor",
      href: "/outages",
      color: "from-amber-500/10 to-amber-900/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "report-breakdown",
      title: t.quickServices.reportBreakdown,
      description: t.quickServices.reportBreakdownDesc,
      icon: AlertTriangle,
      badge: "24/7 Crew",
      action: () => setReportModalOpen(true),
      color: "from-orange-500/10 to-orange-900/10 text-orange-600 dark:text-orange-400",
    },
    {
      id: "solar-services",
      title: t.quickServices.solarServices,
      description: t.quickServices.solarServicesDesc,
      icon: SunMedium,
      badge: "Net Metering",
      action: () => openChatWithQuery("How can I check solar transformer capacity?"),
      color: "from-yellow-500/10 to-yellow-900/10 text-amber-500 dark:text-brand-gold",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t.quickServices.title}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Fast-track customer self-service
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="h-full rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] shadow-card hover:shadow-cardHover hover:border-brand-maroon/40 dark:hover:border-red-900/60 p-4 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:bg-brand-maroon group-hover:text-white transition-colors">
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-maroon dark:group-hover:text-red-400 transition-colors flex items-center gap-1">
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-medium text-brand-maroon dark:text-red-400 group-hover:underline">
                <span>Access Service</span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.id} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.id} onClick={item.action}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
