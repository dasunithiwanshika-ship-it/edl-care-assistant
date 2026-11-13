"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const ClientLayoutShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:pl-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <footer className="lg:pl-64 py-4 px-6 border-t border-gray-200 dark:border-[#27313B] bg-white dark:bg-[#13171d] text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EDL Care Assistant – Independent Demonstration Prototype</span>
          <span>Electricity Distribution Lanka © 2026. All mock customer data fictional.</span>
        </div>
      </footer>
    </div>
  );
};
