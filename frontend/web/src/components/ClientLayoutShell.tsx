"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const ClientLayoutShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0c0f14]">
      {/* Sidebar - fixed left matching official portal screenshots */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main wrapper shifted left for sidebar on desktop */}
      <div className="flex flex-col flex-1 lg:pl-64 transition-all duration-300">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        
        {/* Footer exactly matching Screenshot 2 */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13171d] text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>EDLCare © 2026 - All rights reserved.</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
              <span>Powered by</span>
              <span className="font-extrabold text-[#6c002c] dark:text-[#f87171]">CEBAssist™</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
