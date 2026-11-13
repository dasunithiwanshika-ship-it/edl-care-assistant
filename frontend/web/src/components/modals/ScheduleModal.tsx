"use client";

import React, { useState } from "react";
import { X, Zap, Search, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  const [selectedGroup, setSelectedGroup] = useState("Group A");

  if (!isOpen) return null;

  const schedules = [
    { time: "08:30 AM – 10:30 AM", type: "Morning Slot", status: "Completed" },
    { time: "02:00 PM – 04:00 PM", type: "Afternoon Slot", status: "Scheduled" },
    { time: "06:00 PM – 07:30 PM", type: "Peak Evening Slot", status: "Standby" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1a212b] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#6c002c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F8BB15]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Power Cut Schedule Search
              </h3>
              <p className="text-xs text-red-200">
                Rotational Maintenance & Interruption Slots
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Distribution Sub-Group
            </label>
            <div className="flex gap-2">
              {["Group A", "Group B", "Group C", "Group D"].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    selectedGroup === grp
                      ? "bg-[#6c002c] text-white border-[#6c002c]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 flex justify-between">
              <span>{selectedGroup} – Friday, 13 Nov 2026</span>
              <span className="text-[10px] text-emerald-600 font-bold">Grid Normal</span>
            </div>
            {schedules.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-mono font-bold block text-slate-900 dark:text-white">{item.time}</span>
                    <span className="text-[10px] text-slate-500">{item.type}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "Completed"
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    : item.status === "Scheduled"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-colors"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
