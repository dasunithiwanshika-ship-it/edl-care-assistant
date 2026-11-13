"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Theme, CustomerAccount } from "@/types";
import { TRANSLATIONS, TranslationStrings } from "@/data/translations";
import { MOCK_CUSTOMER_ACCOUNT } from "@/data/mockData";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
  theme: Theme;
  toggleTheme: () => void;
  account: CustomerAccount;
  payBill: (amount: number) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  openChatWithQuery: (query: string) => void;
  initialChatQuery: string | null;
  setInitialChatQuery: (q: string | null) => void;
  reportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;
  billModalOpen: boolean;
  setBillModalOpen: (open: boolean) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  billCalcModalOpen: boolean;
  setBillCalcModalOpen: (open: boolean) => void;
  scheduleModalOpen: boolean;
  setScheduleModalOpen: (open: boolean) => void;
  solarModalOpen: boolean;
  setSolarModalOpen: (open: boolean) => void;
  eBillModalOpen: boolean;
  setEBillModalOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  activeView: "portal" | "dashboard";
  setActiveView: (view: "portal" | "dashboard") => void;
  notificationCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [account, setAccount] = useState<CustomerAccount>(MOCK_CUSTOMER_ACCOUNT);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [billCalcModalOpen, setBillCalcModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [solarModalOpen, setSolarModalOpen] = useState(false);
  const [eBillModalOpen, setEBillModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<"portal" | "dashboard">("portal");
  const [notificationCount, setNotificationCount] = useState(2);

  useEffect(() => {
    const savedTheme = localStorage.getItem("edl_theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    const savedLang = localStorage.getItem("edl_lang") as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("edl_lang", lang);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("edl_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const payBill = (amount: number) => {
    setAccount((prev) => ({
      ...prev,
      outstandingBalance: Math.max(0, prev.outstandingBalance - amount),
      lastPaymentDate: new Date().toISOString().split("T")[0],
      lastPaymentAmount: amount,
    }));
  };

  const openChatWithQuery = (query: string) => {
    setInitialChatQuery(query);
    setIsChatOpen(true);
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        theme,
        toggleTheme,
        account,
        payBill,
        isChatOpen,
        setIsChatOpen,
        openChatWithQuery,
        initialChatQuery,
        setInitialChatQuery,
        reportModalOpen,
        setReportModalOpen,
        billModalOpen,
        setBillModalOpen,
        paymentModalOpen,
        setPaymentModalOpen,
        billCalcModalOpen,
        setBillCalcModalOpen,
        scheduleModalOpen,
        setScheduleModalOpen,
        solarModalOpen,
        setSolarModalOpen,
        eBillModalOpen,
        setEBillModalOpen,
        isLoggedIn,
        setIsLoggedIn,
        activeView,
        setActiveView,
        notificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
