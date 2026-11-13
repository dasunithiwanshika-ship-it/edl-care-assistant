"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  User, 
  Menu, 
  X, 
  CheckCircle, 
  AlertTriangle,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useApp } from "./AppContext";
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
    setIsChatOpen 
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
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#13171d] border-b border-gray-200 dark:border-[#27313B] shadow-sm transition-colors duration-200">
      {/* Demonstration Banner */}
      <div className="bg-brand-maroon text-white text-[11px] sm:text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-brand-gold text-brand-darkMaroon px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          Demo
        </span>
        <span>{t.fictionalDataBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-maroon-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-brand-maroon dark:text-red-400 leading-tight">
                  EDL Care
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {t.brandSubtitle}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-brand-maroon dark:text-brand-gold bg-red-50 dark:bg-red-950/40 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:text-brand-maroon dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/outages"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/outages"
                    ? "text-brand-maroon dark:text-brand-gold bg-red-50 dark:bg-red-950/40 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:text-brand-maroon dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {t.nav.outageMap}
              </Link>
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-maroon dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.nav.aiAssistant}
              </button>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] text-gray-700 dark:text-gray-200 hover:bg-gray-100 text-xs sm:text-sm font-medium transition-colors"
                title={t.header.selectLanguage}
              >
                <Globe className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
                <span className="uppercase font-bold tracking-wide">
                  {language === "en" ? "EN" : language === "si" ? "සිං" : "தமி"}
                </span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-gray-200 dark:border-gray-700 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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
                          ? "text-brand-maroon dark:text-brand-gold font-bold bg-red-50/50 dark:bg-red-950/30"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <span>{item.native}</span>
                      <span className="text-[10px] text-gray-400 uppercase">
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
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t.header.toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-gray-600" />
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
                className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t.header.notifications}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-maroon text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-gray-200 dark:border-gray-700 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Grid Alerts & Notices
                    </span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
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

                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                            October 2026 E-Bill Issued
                          </p>
                          <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5">
                            Bill for Acc #{account.accountNumber} is Rs. 4,850.00. Due by 20 Nov 2026.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowLangMenu(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-maroon text-white flex items-center justify-center font-bold text-xs">
                  {account.customerName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                    {account.customerName}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                    Acc: {account.accountNumber}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-gray-200 dark:border-gray-700 p-4 z-50">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-brand-maroon text-white flex items-center justify-center font-bold text-sm">
                      {account.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {account.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {account.tariffCategory}
                      </p>
                    </div>
                  </div>
                  <div className="py-2 text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account:</span>
                      <span className="font-mono font-medium">{account.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Premises:</span>
                      <span className="truncate max-w-[140px] text-right">{account.premisesAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Supply</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="inline-block text-[10px] text-gray-400 italic">
                      Fictional EDL Customer Record
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
