"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  FileText 
} from "lucide-react";
import { useApp } from "@/components/AppContext";

export default function BreakdownComplaintPage() {
  const { account } = useApp();

  const [selectedAccount, setSelectedAccount] = useState(account.accountNumber);
  const [complaintType, setComplaintType] = useState("total-failure");
  const [name, setName] = useState("Dasuni Thiwanshika Premawardana");
  const [address, setAddress] = useState(account.premisesAddress);
  const [mobile, setMobile] = useState("0771234567");
  const [landline, setLandline] = useState("0112345678");
  const [email, setEmail] = useState("dasunithiwanshika@gmail.com");
  const [details, setDetails] = useState("");
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "TKT-2026-" + Math.floor(1000 + Math.random() * 9000);
    setTicketNumber(id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Title Header Card (Exact match to Screenshot 5) */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#6c002c] text-white flex items-center justify-center shadow-sm">
          <AlertTriangle className="w-6 h-6 text-[#F8BB15]" />
        </div>
        <div>
          <h1 
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
          >
            Breakdown Complaint
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lodge a power interruption or supply fault for a subscribed account.
          </p>
        </div>
      </div>

      {ticketNumber ? (
        <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Complaint Lodged Successfully!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your complaint has been queued for immediate field dispatch. A technician crew has been alerted for feeder zone F-04.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xs mx-auto">
            <span className="text-[11px] text-slate-400 block">Ticket Reference:</span>
            <span className="font-mono font-black text-base text-[#6c002c] dark:text-[#f87171]">
              {ticketNumber}
            </span>
          </div>
          <button
            onClick={() => setTicketNumber(null)}
            className="px-6 py-2 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white text-xs font-bold"
          >
            Lodge Another Complaint
          </button>
        </div>
      ) : (
        /* New Complaint Form (Exact match to Screenshot 5) */
        <div className="rounded-2xl bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            New Complaint Form
          </h3>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
            Please select correct account number and complaint type.
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Row 1: Account Number, Category, Complaint */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
                >
                  <option value={account.accountNumber}>
                    {account.accountNumber} – {account.nickname}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  readOnly
                  value="Breakdown"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint <span className="text-red-500">*</span>
                </label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
                >
                  <option value="total-failure">Total Failure / Power Outage</option>
                  <option value="line-sparking">Overhead Line Sparking / Hazard</option>
                  <option value="low-voltage">Low / Fluctuation Voltage</option>
                  <option value="burnt-meter">Burnt Meter / Smelling Odor</option>
                  <option value="tree-line">Tree Fallen on Service Wire</option>
                </select>
              </div>
            </div>

            {/* Row 2: Name & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Row 3: Mobile Phone, Land Phone, E-mail */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="(077) 000-0000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  10 digits starting with 07X (e.g. 077 123 4567).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Land Phone
                </label>
                <input
                  type="tel"
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                  placeholder="(011) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Optional, 10-digit landline (e.g. 011 234 5678).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Row 4: Anything more to tell */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Anything more to tell
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe specific landmarks, pole number, sparking observations..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white text-xs font-bold shadow-sm transition-all"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
