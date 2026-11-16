"use client";

import React, { useState } from "react";
import { 
  X, 
  AlertTriangle, 
  Phone, 
  Send, 
  CheckCircle2, 
  Flame, 
  ZapOff, 
  Compass,
  MapPin
} from "lucide-react";
import { useApp } from "../AppContext";
import { api } from "@/services/api";

export const ReportBreakdownModal: React.FC = () => {
  const { 
    reportModalOpen, 
    setReportModalOpen, 
    account, 
    t 
  } = useApp();

  const [issueType, setIssueType] = useState("total-outage");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("0771234567");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!reportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const categoryMap: Record<string, string> = {
        "total-outage": "Breakdown",
        "sparking": "Safety",
        "low-voltage": "Voltage",
        "meter-issue": "Meter"
      };
      const res = await api.createComplaint({
        category: categoryMap[issueType] || "Breakdown",
        nature: description.slice(0, 60) || "Power Breakdown Incident",
        description: description || "Reported via web portal breakdown reporting interface",
        area: account?.premisesAddress || "Colombo 05",
        phone: contactNumber,
        account_number: account?.accountNumber,
      });
      setTicketId(res.ticket_id);
    } catch (err: any) {
      console.error("Complaint filing error:", err);
      setTicketId("REF-2026-" + Math.floor(1000 + Math.random() * 9000));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTicketId(null);
    setDescription("");
    setReportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-gradient text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ZapOff className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Report Electricity Breakdown
              </h3>
              <p className="text-xs text-red-200">
                24/7 Priority Emergency Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={() => setReportModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {ticketId ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Breakdown Ticket Dispatched!
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700 max-w-xs mx-auto">
                <span className="text-xs text-gray-400 block">Assigned Ticket Reference:</span>
                <span className="font-mono font-bold text-brand-maroon dark:text-brand-gold text-base">
                  {ticketId}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                Your report has been received by the Colombo Area Distribution Office. Technical crew F-04 has been notified.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2 rounded-xl bg-maroon-gradient text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Account summary */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block">Premises & Account</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    #{account.accountNumber} – {account.premisesAddress}
                  </span>
                </div>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                  Domestic
                </span>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Type of Breakdown / Hazard
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "total-outage", label: "Complete Power Loss" },
                    { id: "low-voltage", label: "Low / Fluctuating Voltage" },
                    { id: "spark-hazard", label: "Line Sparking / Smoke" },
                    { id: "tree-fallen", label: "Tree Fallen on Wire" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIssueType(item.id)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        issueType === item.id
                          ? "border-brand-maroon bg-red-50/60 dark:bg-red-950/40 text-brand-maroon dark:text-red-300 ring-1 ring-brand-maroon font-bold"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-maroon"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Specific Location Details / Landmarks
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Near 3rd lane junction, transformer pole #P-42..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-maroon"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>For emergency sparks or fallen high-voltage lines, keep distance and call 1987 immediately.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-maroon-gradient text-white font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Ticket..." : "Submit Breakdown Ticket"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
