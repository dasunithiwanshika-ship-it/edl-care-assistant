"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, 
  Sun, 
  Zap, 
  FileEdit, 
  CreditCard, 
  Receipt, 
  Calculator, 
  CircleUser, 
  Smartphone,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { EDLCareLogo } from "@/components/EDLCareLogo";
import { useApp } from "@/components/AppContext";

export const EDLCarePortalView: React.FC = () => {
  const { 
    setPaymentModalOpen, 
    setReportModalOpen, 
    setBillCalcModalOpen, 
    setScheduleModalOpen, 
    setSolarModalOpen, 
    setEBillModalOpen,
    setActiveView,
    setIsLoggedIn,
    t
  } = useApp();

  const actionCards = [
    {
      id: "outages",
      title: "Outages",
      description: "View current breakdown status and planned outages on an interactive map.",
      icon: MapPin,
      href: "/outages",
    },
    {
      id: "solar",
      title: "Solar PV Capacity Availability",
      description: "Check grid capacity for solar rooftop systems by transformer and area.",
      icon: Sun,
      action: () => setSolarModalOpen(true),
    },
    {
      id: "power-cut-schedule",
      title: "Power Cut Schedule",
      description: "Look up scheduled maintenance and rotational power interruption times.",
      icon: Zap,
      action: () => setScheduleModalOpen(true),
    },
    {
      id: "complaint",
      title: "Complaint",
      description: "Submit power failure, breakdown, billing, or safety-related complaints.",
      icon: FileEdit,
      action: () => setReportModalOpen(true),
    },
    {
      id: "bill-payments",
      title: "Bill Payments",
      description: "Pay your electricity bill online via LankaPay, card, or internet banking.",
      icon: CreditCard,
      action: () => setPaymentModalOpen(true),
    },
    {
      id: "register-ebill",
      title: "Register for e-Bill",
      description: "Opt-in to receive monthly electricity bills and alerts via SMS / email.",
      icon: Receipt,
      action: () => setEBillModalOpen(true),
    },
    {
      id: "bill-calculator",
      title: "Bill Calculator",
      description: "Estimate your monthly domestic, religious, or commercial tariff costs.",
      icon: Calculator,
      action: () => setBillCalcModalOpen(true),
    },
  ];

  const handleLoginClick = () => {
    setIsLoggedIn(true);
    setActiveView("dashboard");
  };

  return (
    <div className="py-4 sm:py-8 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Welcome Hero Section */}
      <div className="text-center space-y-2">
        <div className="mb-4 flex justify-center">
          <EDLCareLogo size="lg" showSubtitle={true} />
        </div>

        <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 dark:text-slate-300 uppercase">
          Welcome to
        </p>

        <h1 
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#6c002c] dark:text-[#f87171]"
          style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
        >
          EDLCare Web Portal
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
          Quick access to outage updates, schedules, complaints, bill tools, and e-services — all in one place.
        </p>
      </div>

      {/* 7-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actionCards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <div className="h-full rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-cardHover hover:-translate-y-1 hover:border-[#911440]/30 transition-all duration-300 p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
              <div>
                {/* Icon Container with ring and hover effect */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#911440] dark:text-[#f87171] ring-1 ring-slate-200 dark:ring-slate-700 group-hover:scale-105 group-hover:bg-[#911440]/10 group-hover:ring-[#911440]/30 flex items-center justify-center transition-all mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#6c002c] dark:group-hover:text-[#f87171] transition-colors leading-snug">
                  {card.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-[#911440] dark:text-[#f87171] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Access Service</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.id} href={card.href} className="block h-full">
              {cardContent}
            </Link>
          ) : (
            <div key={card.id} onClick={card.action} className="h-full">
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Login CTA Banner */}
      <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center shadow-card space-y-4">
        <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
          For more personalized services, please login to your EDLCare account
        </p>

        <button
          onClick={handleLoginClick}
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-[#009966] hover:bg-[#008055] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <CircleUser className="w-5 h-5" />
          <span>Login to Account</span>
        </button>

        <p className="text-[11px] text-slate-400">
          Access your premises billing history, live meter telemetry, and account tariffs.
        </p>
      </div>

      {/* Mobile App Promotion Section */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#161B22] dark:to-[#11161d] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base">
          <Smartphone className="w-5 h-5 text-[#6c002c] dark:text-[#f87171]" />
          <span>Get EDLCare on your phone</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Download the official EDLCare mobile app to manage connections, receive breakdown alerts, and track bills on the go.
        </p>

        {/* Store Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Apple App Store */}
          <a
            href="https://apps.apple.com/lk/app/edlcare/id6768632237"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-slate-900 flex items-center gap-2.5 shadow-sm transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.35-.55.63-.99 1.66-.86 2.67.99.08 2.02-.49 2.55-1.17z"/>
            </svg>
            <div className="text-left leading-none">
              <span className="text-[9px] text-slate-300 block">Download on the</span>
              <span className="text-xs font-bold font-sans">App Store</span>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="https://play.google.com/store/apps/details?id=com.edl.lk.edlcare"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-slate-900 flex items-center gap-2.5 shadow-sm transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a2.03 2.03 0 0 1-1.01-1.745V3.559c0-.705.378-1.353 1.01-1.745zM15.207 13.414l2.766 2.766-12.723 7.346 9.957-10.112zM19.387 10.74l1.965 1.135c.864.498.864 1.312 0 1.81l-1.965 1.135-3.08-3.08 3.08-3.08zM5.25 1.474l12.723 7.346-2.766 2.766L5.25 1.474z"/>
            </svg>
            <div className="text-left leading-none">
              <span className="text-[9px] text-slate-300 block">GET IT ON</span>
              <span className="text-xs font-bold font-sans">Google Play</span>
            </div>
          </a>

          {/* Huawei AppGallery */}
          <a
            href="https://appgallery.huawei.com/app/C117639559"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-slate-900 flex items-center gap-2.5 shadow-sm transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <div className="text-left leading-none">
              <span className="text-[9px] text-slate-300 block">EXPLORE IT ON</span>
              <span className="text-xs font-bold font-sans">AppGallery</span>
            </div>
          </a>
        </div>
      </div>

      {/* Powered by CEBAssist Footer Attribution matching official portal */}
      <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold tracking-wider text-slate-600 dark:text-slate-400">
          POWERED BY CEBAssist™ | © 2026 Electricity Distribution Lanka (Private) Limited
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Independent Demonstration Prototype with Google Gemini AI Integration.
        </p>
      </div>
    </div>
  );
};
