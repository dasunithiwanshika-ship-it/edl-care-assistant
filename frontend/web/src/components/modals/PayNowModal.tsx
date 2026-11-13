"use client";

import React, { useState } from "react";
import { 
  X, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Lock
} from "lucide-react";
import { useApp } from "../AppContext";
import { formatCurrency } from "@/lib/utils";

export const PayNowModal: React.FC = () => {
  const { 
    paymentModalOpen, 
    setPaymentModalOpen, 
    account, 
    payBill, 
    t 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customAmount, setCustomAmount] = useState(account.outstandingBalance.toString());

  if (!paymentModalOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      payBill(parseFloat(customAmount) || account.outstandingBalance);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPaymentModalOpen(false);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-gradient text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {t.accountCard.paymentModalTitle}
              </h3>
              <p className="text-xs text-red-200">
                Fictional Simulation Gateway
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Payment Successful!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Transaction ref #EDL-PAY-{Math.floor(100000 + Math.random() * 900000)}. Your balance has been updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {/* Account Pill */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Account #{account.accountNumber}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{account.nickname} ({account.customerName})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 dark:text-gray-400 block">Outstanding</span>
                  <span className="font-bold text-brand-maroon dark:text-red-400 text-sm">
                    {formatCurrency(account.outstandingBalance)}
                  </span>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Amount (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Mock Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      paymentMethod === "card"
                        ? "border-brand-maroon bg-red-50/60 dark:bg-red-950/30 text-brand-maroon dark:text-red-300 ring-1 ring-brand-maroon"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      paymentMethod === "bank"
                        ? "border-brand-maroon bg-red-50/60 dark:bg-red-950/30 text-brand-maroon dark:text-red-300 ring-1 ring-brand-maroon"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
                    <span>LankaQR / Internet Banking</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-brand-maroon dark:text-brand-gold shrink-0" />
                <span>Simulated payment test environment. No actual banking data or real transactions are processed.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t.accountCard.close}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-maroon-gradient text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Simulation...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-brand-gold" />
                      <span>Confirm {formatCurrency(parseFloat(customAmount) || 0)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
