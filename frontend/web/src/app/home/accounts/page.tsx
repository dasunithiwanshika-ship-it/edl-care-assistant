"use client";

import React, { useState } from "react";
import { 
  User, 
  Info, 
  Plus, 
  CheckCircle2, 
  CreditCard, 
  Receipt, 
  Zap, 
  AlertCircle 
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { AccountSummaryCard } from "@/features/dashboard/AccountSummaryCard";
import { MonthlyUsageCard } from "@/features/dashboard/MonthlyUsageCard";
import { formatCurrency } from "@/lib/utils";

export default function MyAccountsPage() {
  const { account, setPaymentModalOpen, setBillModalOpen } = useApp();
  const [hasSubscribedAccount, setHasSubscribedAccount] = useState(true);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Title Header Card (Exact match to Screenshot 4) */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#6c002c] text-white flex items-center justify-center shadow-sm">
          <User className="w-6 h-6 text-[#F8BB15]" />
        </div>
        <div>
          <h1 
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
          >
            My Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your Subscribed Electricity Accounts.
          </p>
        </div>
      </div>

      {/* Yellow Notice Banner (Exact match to Screenshot 4) */}
      <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 p-4 space-y-1 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Active Demonstration Electricity Account Loaded</span>
        </div>
        <p className="text-amber-800 dark:text-amber-300 pl-6 leading-relaxed text-[11px]">
          Account #{account.accountNumber} ({account.nickname}) is currently subscribed under your EDLCare portal session. To connect additional meters or commercial premises, use the subscription tool below.
        </p>
      </div>

      {/* Subscribed Account Card Container */}
      <div className="space-y-6">
        <AccountSummaryCard />
        <MonthlyUsageCard />
      </div>

      {/* Subscribe New Account Card Footer */}
      <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-8 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Zap className="w-6 h-6 text-[#F8BB15]" />
        </div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Link Another Electricity Account
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add your office, secondary residence, or solar net-metering account to manage multi-premise billing from one screen.
        </p>
        <button
          onClick={() => alert("Subscribe New Account modal (Demo)")}
          className="px-6 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-[#6c002c] dark:text-[#f87171] border border-red-200 dark:border-red-900/50 text-xs font-bold transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Subscribe New Account</span>
        </button>
      </div>
    </div>
  );
}
