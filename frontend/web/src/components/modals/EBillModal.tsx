"use client";

import React, { useState } from "react";
import { X, Receipt, CheckCircle2, Mail, Phone } from "lucide-react";

interface EBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EBillModal: React.FC<EBillModalProps> = ({ isOpen, onClose }) => {
  const [accNo, setAccNo] = useState("0412345678");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#6c002c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#F8BB15]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Register for e-Bill
              </h3>
              <p className="text-xs text-red-200">
                Paperless SMS & Email Monthly Statements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isDone ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Registration Successful!
              </h4>
              <p className="text-xs text-slate-500">
                Account #{accNo} is now registered for electronic monthly billing.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-xl bg-[#6c002c] text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Electricity Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  value={accNo}
                  onChange={(e) => setAccNo(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address for PDF e-Bill
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number for SMS Bill Alerts
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="0771234567"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-colors"
                >
                  Confirm e-Bill Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
