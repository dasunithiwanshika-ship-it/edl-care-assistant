"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useApp } from "./AppContext";

export const ClientLayoutShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeView } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        {/* Sidebar is available in Dashboard view or when toggled */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            activeView === "dashboard" ? "lg:pl-64" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <footer
        className={`py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13171d] text-center text-xs text-slate-500 dark:text-slate-400 transition-all ${
          activeView === "dashboard" ? "lg:pl-64" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            POWERED BY CEBAssist™ | © 2026 Electricity Distribution Lanka (Private) Limited
          </span>
          <span className="text-[11px] text-slate-400">
            Official Inspired EDLCare Demonstration Portal
          </span>
        </div>
      </footer>
    </div>
  );
};
