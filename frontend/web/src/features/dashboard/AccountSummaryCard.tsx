"use client";

import React from "react";
import { 
  Home, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Zap, 
  Info, 
  ShieldAlert, 
  CheckCircle,
  Clock
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { formatCurrency } from "@/lib/utils";

export const AccountSummaryCard: React.FC = () => {
  const { 
    account, 
    t, 
    setBillModalOpen, 
    setPaymentModalOpen 
  } = useApp();

  return (
    <div 
      id="account-summary"
      className="relative rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200/80 dark:border-[#27313B] shadow-card hover:shadow-cardHover transition-all p-5 sm:p-6 overflow-hidden"
    >
      {/* Decorative Brand Accent Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-maroon/10 via-brand-gold/10 to-transparent rounded-bl-full pointer-events-none" />

      {/* Top Header of Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#27313B]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-brand-maroon dark:text-brand-gold flex items-center justify-center font-bold shadow-inner">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {account.nickname}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {account.premisesAddress}
            </p>
          </div>
        </div>

        {/* Fictional Demo Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[11px] font-medium text-amber-800 dark:text-amber-300">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Fictional Demonstration Account</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
        {/* Account Number */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {t.accountCard.accountNumber}
          </span>
          <span className="text-base font-mono font-bold text-gray-900 dark:text-white tracking-wider">
            {account.accountNumber}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">
            Tariff: {account.tariffCategory}
          </span>
        </div>

        {/* Billing Month */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {t.accountCard.billingMonth}
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {account.billingMonth}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">
            Cycle ended 31 Oct
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40">
          <span className="text-[11px] font-medium text-brand-maroon dark:text-red-300 block mb-1">
            {t.accountCard.outstandingBalance}
          </span>
          <span className="text-xl font-bold font-mono text-brand-maroon dark:text-red-400">
            {formatCurrency(account.outstandingBalance)}
          </span>
          <span className="text-[10px] text-red-700/80 dark:text-red-300/70 block mt-0.5">
            Includes Oct 2026 usage & tariff
          </span>
        </div>

        {/* Due Date & Last Paid */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {t.accountCard.dueDate}
          </span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-base font-bold text-gray-900 dark:text-white">
              20 Nov 2026
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
            Last paid: {formatCurrency(account.lastPaymentAmount)} on 15 Oct
          </span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#27313B]">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldAlert className="w-4 h-4 text-brand-maroon dark:text-brand-gold shrink-0" />
          <span>Demonstration environment: Click buttons to simulate real utility operations.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBillModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Receipt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{t.accountCard.billDetails}</span>
          </button>

          <button
            onClick={() => setPaymentModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-maroon-gradient text-white text-xs sm:text-sm font-bold hover:opacity-95 shadow-md shadow-red-950/20 transition-all flex items-center gap-2 group"
          >
            <CreditCard className="w-4 h-4 text-brand-gold group-hover:scale-110 transition-transform" />
            <span>{t.accountCard.payNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
