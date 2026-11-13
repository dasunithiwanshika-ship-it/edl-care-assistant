"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Wrench, 
  MapPin, 
  Sun, 
  Plug, 
  ArrowRight, 
  Plus, 
  CreditCard, 
  Receipt, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldAlert
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { AccountSummaryCard } from "@/features/dashboard/AccountSummaryCard";
import { MonthlyUsageCard } from "@/features/dashboard/MonthlyUsageCard";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { 
    account, 
    setPaymentModalOpen, 
    setBillModalOpen, 
    setReportModalOpen, 
    setScheduleModalOpen, 
    setSolarModalOpen 
  } = useApp();

  const [currentTime, setCurrentTime] = useState("12:51 PM");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      id: "complaint",
      title: "Breakdown Complaint",
      description: "Help us restore your power outage. Report a breakdown complaint.",
      iconBg: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
      actionText: "Lodge →",
      actionColor: "text-[#6c002c] dark:text-[#f87171]",
      href: "/services/breakdown-complaint",
    },
    {
      id: "outage-calendar",
      title: "Outage Calendar",
      description: "Check scheduled power interruptions affecting your electricity connection.",
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
      actionText: "View →",
      actionColor: "text-sky-600 dark:text-sky-400",
      action: () => setScheduleModalOpen(true),
    },
    {
      id: "service-request",
      title: "Service Request",
      description: "Submit a new service request for your electricity connection.",
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      actionText: "Apply →",
      actionColor: "text-purple-600 dark:text-purple-400",
      action: () => alert("Service Request Portal (Demo)"),
    },
    {
      id: "outage-map",
      title: "Outage Map",
      description: "Check current power outages in your area.",
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      actionText: "View →",
      actionColor: "text-emerald-600 dark:text-emerald-400",
      href: "/outages",
    },
    {
      id: "solar-connection",
      title: "New Solar PV Connection",
      description: "Apply for a new solar PV connection.",
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      actionText: "Apply →",
      actionColor: "text-amber-600 dark:text-amber-400",
      action: () => setSolarModalOpen(true),
    },
    {
      id: "new-connection",
      title: "New Service Connection",
      description: "Apply for a new electricity service connection.",
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
      actionText: "Apply →",
      actionColor: "text-indigo-600 dark:text-indigo-400",
      action: () => alert("New Service Connection Portal (Demo)"),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Greeting & Clock Banner (Exact match to Screenshot 1) */}
      <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight"
            style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
          >
            Hi,{" "}
            <span className="text-[#6c002c] dark:text-[#f87171]">
              Dasuni Thiwanshika Premawardana
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome to your EDLCare online portal!
          </p>
        </div>

        {/* Clock & Sun Slider Widget matching Screenshot 1 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col items-center justify-center min-w-[210px] text-center shadow-xs">
          <span 
            className="text-xl sm:text-2xl font-black text-[#6c002c] dark:text-[#f87171] tracking-tight"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {currentTime}
          </span>
          <div className="w-full flex items-center justify-between gap-2 mt-1 text-[10px] text-slate-400 font-mono">
            <span>12 AM</span>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700" />
              <Sun className="w-4 h-4 text-amber-500 absolute" />
            </div>
            <span>12 PM</span>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700" />
            </div>
            <span>12 AM</span>
          </div>
        </div>
      </div>

      {/* 2. Big Hero Banner: "Enrich life through power" (Exact match to Screenshot 1) */}
      <div 
        className="rounded-3xl overflow-hidden shadow-card relative p-8 sm:p-12 text-white min-h-[260px] sm:min-h-[300px] flex flex-col justify-end"
        style={{
          background: "linear-gradient(135deg, rgba(16, 36, 24, 0.9) 0%, rgba(13, 24, 18, 0.85) 100%), radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 60%)",
        }}
      >
        {/* Subtle Wind Turbine / Power Lines SVG Graphic */}
        <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
          <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <line x1="100" y1="40" x2="100" y2="190" strokeWidth="3" />
            <circle cx="100" cy="40" r="8" fill="currentColor" />
            <line x1="100" y1="40" x2="60" y2="10" strokeWidth="2.5" />
            <line x1="100" y1="40" x2="140" y2="10" strokeWidth="2.5" />
            <line x1="100" y1="40" x2="100" y2="85" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider">
              EDLCare
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-emerald-400 font-bold text-[10px] flex items-center gap-1.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Enrich life through power
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
            EDLCare — generating, transmitting, and distributing electricity with reliability you can count on.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button className="px-5 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white font-bold text-xs border border-white/20 transition-all">
              EDLCare
            </button>
            <button className="px-4 py-2 rounded-full text-white font-bold text-xs uppercase tracking-wider hover:underline transition-all">
              EDLCARE ENERGY SOLUTIONS
            </button>
          </div>
        </div>
      </div>

      {/* 3. Subscribed Electricity Account & Calendar Strip (Screenshot 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subscribed Account Details */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Subscribed Electricity Account
                </span>
                <span className="text-xs text-slate-500">
                  Account #<strong>{account.accountNumber}</strong> – {account.nickname} ({account.customerName})
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Supply
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Billing Month</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{account.billingMonth}</span>
              </div>

              <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40">
                <span className="text-[11px] text-[#6c002c] dark:text-red-300 block">Outstanding Balance</span>
                <span className="font-bold font-mono text-base text-[#6c002c] dark:text-red-400">
                  {formatCurrency(account.outstandingBalance)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Payment Due Date</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{account.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Last payment: {formatCurrency(account.lastPaymentAmount)} on 15 Oct 2026
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Bill Details
              </button>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white text-xs font-bold shadow-sm"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Right: Calendar & Subscribe New Account button */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                November 2026
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Cycle Progress
              </span>
            </div>

            {/* Calendar Numbers Strip (15 to 30) matching Screenshot 2 */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold py-2">
              {[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day) => (
                <div
                  key={day}
                  className={`py-1.5 rounded-lg text-[11px] ${
                    day === 20
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => alert("Subscribe New Account Form (Demo)")}
              className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-[#6c002c] dark:text-[#f87171] border border-red-200 dark:border-red-900/50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Subscribe New Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Monthly Consumption Chart */}
      <MonthlyUsageCard />

      {/* 5. Quick Action Section (Exact match to Screenshot 2) */}
      <div className="space-y-4 pt-2">
        <h3 
          className="text-lg font-bold text-slate-900 dark:text-white"
          style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
        >
          Quick Action
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((qa) => {
            const cardContent = (
              <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-cardHover hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full group cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Icon Square with soft tinted background */}
                  <div className={`w-12 h-12 rounded-2xl ${qa.iconBg} flex items-center justify-center shrink-0`}>
                    {qa.id === "complaint" && <AlertTriangle className="w-5 h-5" />}
                    {qa.id === "outage-calendar" && <CalendarIcon className="w-5 h-5" />}
                    {qa.id === "service-request" && <Wrench className="w-5 h-5" />}
                    {qa.id === "outage-map" && <MapPin className="w-5 h-5" />}
                    {qa.id === "solar-connection" && <Sun className="w-5 h-5" />}
                    {qa.id === "new-connection" && <Plug className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#6c002c] dark:group-hover:text-[#f87171] transition-colors">
                      {qa.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {qa.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex justify-start">
                  <span className={`text-xs font-bold ${qa.actionColor} group-hover:underline`}>
                    {qa.actionText}
                  </span>
                </div>
              </div>
            );

            return qa.href ? (
              <Link key={qa.id} href={qa.href} className="block h-full">
                {cardContent}
              </Link>
            ) : (
              <div key={qa.id} onClick={qa.action} className="h-full">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
