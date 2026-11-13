"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Menu, 
  CircleUser,
  LayoutDashboard,
  Home as HomeIcon,
  CheckCircle, 
  AlertTriangle,
  Bot
} from "lucide-react";
import { useApp } from "./AppContext";
import { EDLCareLogo } from "./EDLCareLogo";
import { Language } from "@/types";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    language, 
    setLanguage, 
    t, 
    theme, 
    toggleTheme, 
    account, 
    notificationCount,
    setIsChatOpen,
    activeView,
    setActiveView,
    isLoggedIn,
    setIsLoggedIn
  } = useApp();

  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "si", label: "Sinhala", native: "සිංහල" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#13171d] border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top Banner Notice */}
      <div className="bg-[#6c002c] text-white text-[11px] sm:text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-[#F8BB15] text-[#42001a] px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider">
          Official Inspired UI
        </span>
        <span className="truncate">
          Electricity Distribution Lanka (EDL) Demonstration Prototype
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & EDLCare Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center group">
              <EDLCareLogo size="md" showSubtitle={false} />
            </Link>

            {/* Desktop Navigation View Switcher */}
            <nav className="hidden md:flex items-center gap-1.5 ml-8 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveView("portal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "portal" && pathname === "/"
                    ? "bg-white dark:bg-[#1e2530] text-[#6c002c] dark:text-[#f87171] shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Portal View</span>
              </button>

              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  setActiveView("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "dashboard" && pathname === "/"
                    ? "bg-white dark:bg-[#1e2530] text-[#6c002c] dark:text-[#f87171] shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Customer Dashboard</span>
              </button>

              <Link
                href="/outages"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pathname === "/outages"
                    ? "bg-white dark:bg-[#1e2530] text-[#6c002c] dark:text-[#f87171] shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                {t.nav.outageMap}
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6c002c]/10 dark:bg-[#6c002c]/20 hover:bg-[#6c002c]/15 text-[#6c002c] dark:text-[#f87171] text-xs font-bold transition-all"
            >
              <Bot className="w-4 h-4 text-[#F8BB15]" />
              <span>AI Assistant</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212b] text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
                title={t.header.selectLanguage}
              >
                <Globe className="w-4 h-4 text-[#6c002c] dark:text-[#F8BB15]" />
                <span className="uppercase font-bold tracking-wide">
                  {language === "en" ? "EN" : language === "si" ? "සිං" : "தமி"}
                </span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t.header.selectLanguage}
                  </div>
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ${
                        language === item.code
                          ? "text-[#6c002c] dark:text-[#F8BB15] font-bold bg-red-50/50 dark:bg-red-950/30"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{item.native}</span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {item.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212b] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.header.toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowLangMenu(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212b] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t.header.notifications}
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6c002c] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Grid Alerts & Notices
                    </span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-[#6c002c] dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                            Planned Maintenance on F-12
                          </p>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                            Scheduled transformer upgrade on 14 Nov, 08:30 AM – 01:00 PM (Kandy Zone).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                            October 2026 E-Bill Issued
                          </p>
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                            Bill for Acc #{account.accountNumber} is Rs. 4,850.00. Due by 20 Nov 2026.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Login / Profile Button */}
            <div className="relative">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                    setShowLangMenu(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a212b] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#6c002c] text-white flex items-center justify-center font-bold text-xs">
                    {account.customerName.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {account.customerName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Acc: {account.accountNumber}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setActiveView("dashboard");
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-sm transition-all"
                >
                  <CircleUser className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {showProfileMenu && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 p-4 z-50">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-[#6c002c] text-white flex items-center justify-center font-bold text-sm">
                      {account.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {account.customerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {account.tariffCategory}
                      </p>
                    </div>
                  </div>
                  <div className="py-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-mono font-medium">{account.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Premises:</span>
                      <span className="truncate max-w-[140px] text-right">{account.premisesAddress}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setActiveView("portal");
                      setShowProfileMenu(false);
                    }}
                    className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    Sign Out to Public Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
