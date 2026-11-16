"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, Theme, CustomerAccount, ChatMode, ConsumptionDataPoint } from "@/types";
import { TRANSLATIONS, TranslationStrings } from "@/data/translations";
import { MOCK_CUSTOMER_ACCOUNT, MOCK_CONSUMPTION_DATA } from "@/data/mockData";
import { api } from "@/services/api";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
  theme: Theme;
  toggleTheme: () => void;
  account: CustomerAccount;
  bills: any[];
  consumptionData: ConsumptionDataPoint[];
  refreshAccount: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  payBill: (amount: number) => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  openChatWithQuery: (query: string, mode?: ChatMode) => void;
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
  const [bills, setBills] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionDataPoint[]>(MOCK_CONSUMPTION_DATA);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("customer");
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

  const mapProfileToAccount = (profile: any): CustomerAccount => ({
    accountNumber: profile.account_number || "0412345678",
    nickname: "Home",
    customerName: profile.full_name || "Dasuni Thiwanshika Premawardana",
    tariffCategory: profile.tariff_category || "Domestic (D-1)",
    premisesAddress: profile.premises_address || "No. 42, Sri Jayawardenepura Mw, Colombo 05",
    billingMonth: "October 2026",
    outstandingBalance: profile.outstanding_balance ?? 4850.0,
    dueDate: profile.due_date || "2026-11-25",
    lastPaymentDate: "2026-10-15",
    lastPaymentAmount: 5200.0,
    monthlyAverageKwh: profile.monthly_average_kwh || 150,
    isFictionalDemo: true,
  });

  const refreshAccount = useCallback(async () => {
    try {
      const token = api.getToken();
      if (!token) return;

      const profile = await api.getMyProfile();
      if (profile) {
        setAccount(mapProfileToAccount(profile));
        setIsLoggedIn(true);
      }

      const billsData = await api.getMyBills().catch(() => []);
      if (Array.isArray(billsData) && billsData.length > 0) {
        setBills(billsData);
      }

      const usage = await api.getMyConsumption().catch(() => []);
      if (Array.isArray(usage) && usage.length > 0) {
        const mapped: ConsumptionDataPoint[] = usage.map((u: any) => ({
          month: u.month,
          year: u.year,
          kwh: u.units_kwh,
          amount: u.amount_lkr,
          units: u.units_kwh,
        }));
        setConsumptionData(mapped);
      }
    } catch (e) {
      console.warn("Failed to load customer profile from backend:", e);
    }
  }, []);

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

    // Check if token exists in localStorage
    const existingToken = api.getToken();
    if (existingToken) {
      setIsLoggedIn(true);
      setChatMode("customer");
      refreshAccount();
    }
  }, [refreshAccount]);

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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await api.login(username, password);
      setIsLoggedIn(true);
      setChatMode("customer");
      await refreshAccount();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setIsLoggedIn(false);
    setChatMode("guest");
    setAccount(MOCK_CUSTOMER_ACCOUNT);
    setBills([]);
    setConsumptionData(MOCK_CONSUMPTION_DATA);
  };

  const payBill = async (amount: number) => {
    try {
      await api.payBill(amount).catch(() => null);
    } finally {
      setAccount((prev) => ({
        ...prev,
        outstandingBalance: Math.max(0, prev.outstandingBalance - amount),
        lastPaymentDate: new Date().toISOString().split("T")[0],
        lastPaymentAmount: amount,
      }));
      refreshAccount().catch(() => null);
    }
  };

  const openChatWithQuery = (query: string, mode?: ChatMode) => {
    if (mode) setChatMode(mode);
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
        bills,
        consumptionData,
        refreshAccount,
        login,
        logout,
        payBill,
        isChatOpen,
        setIsChatOpen,
        chatMode,
        setChatMode,
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
