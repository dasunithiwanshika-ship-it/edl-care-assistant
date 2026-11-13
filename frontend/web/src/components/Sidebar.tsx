"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home as HomeIcon, 
  Calculator, 
  UserCheck, 
  Wrench, 
  AlertTriangle, 
  FileText, 
  Sun, 
  Plug, 
  FolderClock, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  Bot
} from "lucide-react";
import { EDLCareLogo } from "./EDLCareLogo";
import { useApp } from "./AppContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { setIsChatOpen, setSolarModalOpen, setScheduleModalOpen } = useApp();

  const [filterText, setFilterText] = useState("");
  const [homeExpanded, setHomeExpanded] = useState(true);
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [outagesExpanded, setOutagesExpanded] = useState(true);

  const homeLinks = [
    { label: "Dashboard", href: "/", icon: HomeIcon },
    { label: "Bill Calculator", href: "/home/bill-calculator", icon: Calculator },
    { label: "My Accounts", href: "/home/accounts", icon: UserCheck },
  ];

  const serviceLinks = [
    { label: "Breakdown Complaint", href: "/services/breakdown-complaint", icon: AlertTriangle },
    { label: "Service Request", href: "#service-request", icon: Wrench, action: () => alert("Service Request portal (Demo)") },
    { label: "New Solar PV Connection", href: "#new-solar", icon: Sun, action: () => setSolarModalOpen(true) },
    { label: "Solar PV Capacity Availability", href: "#solar-capacity", icon: Sun, action: () => setSolarModalOpen(true) },
    { label: "New Service Connection", href: "#new-connection", icon: Plug, action: () => alert("New Service Connection application (Demo)") },
    { label: "My Requests", href: "#my-requests", icon: FolderClock, action: () => alert("My Requests history (Demo)") },
  ];

  const outageLinks = [
    { label: "Outage Map", href: "/outages", icon: MapPin },
    { label: "Outage Calendar", href: "#outage-calendar", icon: Calendar, action: () => setScheduleModalOpen(true) },
  ];

  const otherLinks = [
    { label: "Contacts", href: "#contacts", icon: Phone },
    { label: "My Profile", href: "#profile", icon: User },
    { label: "About", href: "#about", icon: Info },
    { label: "FAQ", href: "#faq", icon: HelpCircle },
  ];

  const matchesFilter = (label: string) => {
    if (!filterText.trim()) return true;
    return label.toLowerCase().includes(filterText.toLowerCase());
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#13171d] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Brand Logo */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center">
              <EDLCareLogo size="md" showSubtitle={true} />
            </Link>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter menu search input */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter menu"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
              />
            </div>
          </div>

          {/* Scrollable Navigation Tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {/* Section: Home */}
            <div>
              <button
                onClick={() => setHomeExpanded(!homeExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4 text-slate-500" />
                  <span>Home</span>
                </div>
                {homeExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {homeExpanded && (
                <div className="pl-6 space-y-1 pt-1">
                  {homeLinks.filter(l => matchesFilter(l.label)).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Services */}
            <div>
              <button
                onClick={() => setServicesExpanded(!servicesExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <span>Services</span>
                </div>
                {servicesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {servicesExpanded && (
                <div className="pl-6 space-y-1 pt-1">
                  {serviceLinks.filter(l => matchesFilter(l.label)).map((item) => {
                    const isActive = pathname === item.href;
                    return item.action ? (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Outages */}
            <div>
              <button
                onClick={() => setOutagesExpanded(!outagesExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-500" />
                  <span>Outages</span>
                </div>
                {outagesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {outagesExpanded && (
                <div className="pl-6 space-y-1 pt-1">
                  {outageLinks.filter(l => matchesFilter(l.label)).map((item) => {
                    const isActive = pathname === item.href;
                    return item.action ? (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`block py-1.5 px-3 rounded-lg text-xs transition-colors ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Standalone links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-0.5">
              {otherLinks.filter(l => matchesFilter(l.label)).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI Assistant Quick Trigger at bottom of sidebar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c0f14]/40">
            <button
              onClick={() => {
                setIsChatOpen(true);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#6c002c]/10 to-[#F8BB15]/10 text-[#6c002c] dark:text-[#f87171] border border-[#6c002c]/20 hover:bg-[#6c002c]/15 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#F8BB15]" />
                <span>AI Assistant</span>
              </div>
              <span className="text-[10px] bg-[#6c002c] text-white px-1.5 py-0.5 rounded-full font-bold">
                Online
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
