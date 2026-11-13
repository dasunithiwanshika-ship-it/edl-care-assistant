"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Menu, 
  User, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useApp } from "./AppContext";
import { Language } from "@/types";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    notificationCount 
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Compute dynamic breadcrumbs from pathname
  const getBreadcrumbs = () => {
    if (pathname === "/home/bill-calculator") {
      return [
        { label: "Home", href: "/" },
        { label: "Bill Calculator", href: "/home/bill-calculator" },
      ];
    }
    if (pathname === "/home/accounts") {
      return [
        { label: "Home", href: "/" },
        { label: "My Accounts", href: "/home/accounts" },
      ];
    }
    if (pathname === "/services/breakdown-complaint") {
      return [
        { label: "Services", href: "/" },
        { label: "Breakdown Complaint", href: "/services/breakdown-complaint" },
      ];
    }
    if (pathname === "/outages") {
      return [
        { label: "Outages", href: "/outages" },
        { label: "Outage Map", href: "/outages" },
      ];
    }
    return [
      { label: "Home", href: "/" },
      { label: "Dashboard", href: "/" },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "si", label: "Sinhala", native: "සිංහල" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#13171d] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb nav */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-slate-400">›</span>}
                  <Link
                    href={crumb.href}
                    className={`hover:text-slate-900 dark:hover:text-white transition-colors ${
                      idx === breadcrumbs.length - 1
                        ? "font-semibold text-slate-800 dark:text-slate-100"
                        : "text-slate-500"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Tools matching official UI */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Box */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-8 py-1.5 w-36 lg:w-44 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">
                ⌘K
              </span>
            </div>

            {/* Soon Badge */}
            <div className="hidden sm:flex items-center">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Soon
              </span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Globe className="w-3.5 h-3.5 text-[#6c002c] dark:text-[#f87171]" />
                <span className="uppercase">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex justify-between items-center hover:bg-red-50 dark:hover:bg-red-950/40 ${
                        language === l.code ? "font-bold text-[#6c002c] dark:text-[#f87171]" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowLangMenu(false);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6c002c]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <span>Notifications</span>
                    <span className="text-[10px] text-slate-400">2 Unread</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                      <p className="font-semibold">Maintenance F-12 Kandy</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">14 Nov 08:30 AM – 01:00 PM</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <p className="font-semibold">October E-Bill Ready</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Total Rs. 4,850.00</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & View Profile (matching Screenshot 1) */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center">
                {/* Businessman / User Avatar representation */}
                <div className="w-full h-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                  D
                </div>
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer">
                View profile
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
