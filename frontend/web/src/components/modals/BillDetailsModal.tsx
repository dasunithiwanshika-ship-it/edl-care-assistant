"use client";

import React from "react";
import { 
  X, 
  Receipt, 
  Download, 
  CreditCard, 
  Calendar, 
  Gauge, 
  FileText,
  AlertCircle
} from "lucide-react";
import { useApp } from "../AppContext";
import { formatCurrency } from "@/lib/utils";

export const BillDetailsModal: React.FC = () => {
  const { 
    billModalOpen, 
    setBillModalOpen, 
    setPaymentModalOpen, 
    account, 
    t 
  } = useApp();

  if (!billModalOpen) return null;

  const handleDownload = () => {
    alert("Demo e-Bill PDF download initiated for Account #" + account.accountNumber);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-gradient text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {t.accountCard.billModalTitle}
              </h3>
              <p className="text-xs text-red-200">
                Electricity Distribution Lanka (Demo Statement)
              </p>
            </div>
          </div>
          <button
            onClick={() => setBillModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-xs">
            <div>
              <span className="text-gray-400 block">Customer Name</span>
              <span className="font-bold text-gray-900 dark:text-white">{account.customerName}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Account Number</span>
              <span className="font-mono font-bold text-brand-maroon dark:text-red-400">{account.accountNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Billing Period</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{account.billingMonth}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Tariff Category</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{account.tariffCategory}</span>
            </div>
          </div>

          {/* Meter Readings */}
          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
                Meter Information
              </span>
              <span className="font-mono text-gray-500">Meter #MTR-884920</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg">
                <span className="text-gray-400 block text-[10px]">Previous</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">14,250</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg">
                <span className="text-gray-400 block text-[10px]">Present</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">14,404</span>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/40">
                <span className="text-brand-maroon dark:text-red-300 block text-[10px] font-bold">Units Used</span>
                <span className="font-mono font-extrabold text-brand-maroon dark:text-red-400">154 kWh</span>
              </div>
            </div>
          </div>

          {/* Tariff Breakdown Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              Charge Breakdown
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tier 1 (0 – 60 units @ Rs. 15.00)</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 900.00</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tier 2 (61 – 90 units @ Rs. 22.00)</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 660.00</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tier 3 (91 – 120 units @ Rs. 30.00)</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 900.00</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tier 4 (121 – 154 units @ Rs. 42.00)</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 1,428.00</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fixed Service Charge</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 400.00</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fuel & Forex Adjustment Surcharge</span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">Rs. 562.00</span>
              </div>
              <div className="px-3 py-2.5 flex justify-between bg-red-50/60 dark:bg-red-950/20 font-bold text-sm">
                <span className="text-brand-maroon dark:text-red-400">Total Amount Billed</span>
                <span className="font-mono text-brand-maroon dark:text-red-400">
                  {formatCurrency(account.outstandingBalance)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Due date: 20 Nov 2026. Late payment interest applies after 30 days from billing date.</span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => {
                setBillModalOpen(false);
                setPaymentModalOpen(true);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-maroon-gradient text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-brand-gold" />
              <span>{t.accountCard.payNow}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
