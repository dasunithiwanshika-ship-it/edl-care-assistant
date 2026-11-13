"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserCheck, 
  ReceiptText, 
  TrendingUp, 
  MapPin, 
  AlertCircle, 
  Bot, 
  Settings, 
  PhoneCall, 
  ShieldAlert,
  ChevronRight,
  X
} from "lucide-react";
import { useApp } from "./AppContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { 
    t, 
    setIsChatOpen, 
    setBillModalOpen, 
    setReportModalOpen 
  } = useApp();

  const navItems = [
    {
      label: t.nav.dashboard,
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: t.nav.myAccount,
      href: "#account-summary",
      icon: UserCheck,
      active: false,
      onClick: () => {
        const el = document.getElementById("account-summary");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      label: t.nav.bills,
      href: "#electricity-bills",
      icon: ReceiptText,
      active: false,
      onClick: () => setBillModalOpen(true),
    },
    {
      label: t.nav.consumption,
      href: "#consumption-chart",
      icon: TrendingUp,
      active: false,
      onClick: () => {
        const el = document.getElementById("consumption-chart");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      label: t.nav.outageMap,
      href: "/outages",
      icon: MapPin,
      active: pathname === "/outages",
    },
    {
      label: t.nav.complaints,
      href: "#report-breakdown",
      icon: AlertCircle,
      active: false,
      onClick: () => setReportModalOpen(true),
    },
    {
      label: t.nav.aiAssistant,
      href: "#ai-chat",
      icon: Bot,
      active: false,
      onClick: () => setIsChatOpen(true),
      badge: "Gemini",
    },
    {
      label: t.nav.settings,
      href: "#settings",
      icon: Settings,
      active: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#13171d] border-r border-gray-200 dark:border-[#27313B] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header inside Mobile Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#27313B] lg:hidden">
            <span className="font-bold text-brand-maroon dark:text-red-400">
              {t.brandName}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Main Menu
            </div>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return item.href.startsWith("/") ? (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.active
                      ? "bg-maroon-gradient text-white shadow-md shadow-red-950/20 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-brand-maroon dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? "text-brand-gold" : "text-gray-500 dark:text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-4 h-4 text-brand-gold" />}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-brand-maroon dark:hover:text-white transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-brand-gold/20 text-brand-maroon dark:text-brand-gold border border-brand-gold/40 px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Support & Hotline Card */}
          <div className="p-4 mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 border border-red-200/60 dark:border-red-900/40 p-3.5 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-maroon text-brand-gold mx-auto flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  EDL 24/7 Emergency
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Breakdown & Spark Hazard
                </p>
              </div>
              <div className="inline-block bg-brand-maroon text-white font-mono font-bold text-sm px-3 py-1 rounded-full shadow-sm">
                Dial 1987
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 justify-center text-[10px] text-gray-400 dark:text-gray-500">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Independent Demo System</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
