"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  ChevronDown, 
  MessageSquare, 
  Zap,
  Globe,
  Info,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sun,
  CheckCircle2,
  Table,
  HelpCircle,
  Clock,
  BookOpen,
  Activity,
  Layers
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { ChatMessage, Language, ChatMode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/services/api";

export const ChatbotDrawer: React.FC = () => {
  const { 
    isChatOpen, 
    setIsChatOpen, 
    language, 
    setLanguage, 
    t, 
    initialChatQuery, 
    setInitialChatQuery,
    account,
    setPaymentModalOpen,
    setBillModalOpen,
    chatMode,
    setChatMode
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const sessionIdRef = useRef<string>("sess-" + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on active mode and language
  useEffect(() => {
    const welcome = chatMode === "guest" 
      ? t.chatbot.guestWelcomeMsg 
      : t.chatbot.customerWelcomeMsg;

    setMessages([
      {
        id: "msg-welcome-" + chatMode + "-" + language,
        sender: "assistant",
        content: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        mode: chatMode,
        isMockResponse: false,
      },
    ]);
  }, [language, chatMode, t.chatbot.guestWelcomeMsg, t.chatbot.customerWelcomeMsg]);

  // Handle incoming query from external trigger
  useEffect(() => {
    if (initialChatQuery && isChatOpen) {
      handleUserSend(initialChatQuery);
      setInitialChatQuery(null);
    }
  }, [initialChatQuery, isChatOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Quick reply questions dynamic to active mode
  const guestQuickReplies = [
    { key: "understandBill", text: t.chatbot.quickReplies.understandBill },
    { key: "tariffExpl", text: t.chatbot.quickReplies.tariffExpl },
    { key: "safetyGuide", text: t.chatbot.quickReplies.safetyGuide },
    { key: "generalOutage", text: t.chatbot.quickReplies.generalOutage },
    { key: "guestBillCheck", text: t.chatbot.quickReplies.guestBillCheck },
  ];

  const customerQuickReplies = [
    { key: "myBill", text: t.chatbot.quickReplies.myBill },
    { key: "myConsumption", text: t.chatbot.quickReplies.myConsumption },
    { key: "trackComplaint", text: t.chatbot.quickReplies.trackComplaint },
    { key: "mySolar", text: t.chatbot.quickReplies.mySolar },
  ];

  const activeQuickReplies = chatMode === "guest" ? guestQuickReplies : customerQuickReplies;

  const handleUserSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: language,
      mode: chatMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    try {
      // Send query to FastAPI backend with bearer token, mode, language, and session ID
      const data = await api.sendChat({
        message: text,
        mode: chatMode,
        language: language,
        account_number: account?.accountNumber || "0412345678",
        session_id: sessionIdRef.current,
      });

      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        mode: chatMode,
        isMockResponse: data.is_mock,
        actionRequired: data.action_required as any,
        richCard: data.rich_card,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      return;
    } catch (err: any) {
      console.error("Chat error from backend:", err);
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "assistant",
        content: `⚠️ API Communication Error: Unable to connect to the EDL Care Assistant backend (http://127.0.0.1:8000). ${err.message || "Please ensure the FastAPI service is active."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        mode: chatMode,
        isMockResponse: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
      return;
    }
  };

  const handleReset = () => {
    sessionIdRef.current = "sess-" + Math.random().toString(36).substring(2, 9);
    const welcome = chatMode === "guest" 
      ? t.chatbot.guestWelcomeMsg 
      : t.chatbot.customerWelcomeMsg;

    setMessages([
      {
        id: "msg-welcome-reset-" + Date.now(),
        sender: "assistant",
        content: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        mode: chatMode,
        isMockResponse: false,
      },
    ]);
  };

  const toggleMode = (targetMode: ChatMode) => {
    if (targetMode === chatMode) return;
    setChatMode(targetMode);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-maroon-gradient text-white shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-brand-gold/30"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-brand-gold animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-brand-darkMaroon animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-tight">
                {t.chatbot.title}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                chatMode === "customer" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white/20 text-white"
              }`}>
                {chatMode === "customer" ? "Customer" : "Guest"}
              </span>
            </div>
            <span className="text-[10px] text-red-200 leading-tight">
              AI Support Online
            </span>
          </div>
        </button>
      )}

      {/* Slide-over Chatbot Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[460px] h-[670px] max-h-[90vh] rounded-3xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          
          {/* 1. Header with Brand & Mode Switcher */}
          <div className="bg-maroon-gradient text-white p-3.5 flex flex-col gap-2.5 shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm leading-tight">
                      {t.chatbot.title}
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-gold text-brand-darkMaroon">
                      Gemini + RAG
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Option C • Dual Access</span>
                  </div>
                </div>
              </div>

              {/* Language, Feature Matrix, Reset & Close */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowMatrixModal(true)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-[10px] font-semibold flex items-center gap-1"
                  title="View Guest vs Customer Access Matrix"
                >
                  <Table className="w-3.5 h-3.5 text-brand-gold" />
                  <span className="hidden sm:inline">Compare</span>
                </button>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-black/30 hover:bg-black/40 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-white/20 focus:outline-none cursor-pointer"
                  title="Change Chat Language"
                >
                  <option value="en" className="text-black">EN</option>
                  <option value="si" className="text-black">සිංහල</option>
                  <option value="ta" className="text-black">தமிழ்</option>
                </select>

                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Option C: Dual Mode Selector Bar */}
            <div className="flex items-center justify-between bg-black/25 p-1 rounded-xl border border-white/15">
              <button
                onClick={() => toggleMode("guest")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  chatMode === "guest"
                    ? "bg-white text-brand-maroon shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Guest Mode</span>
              </button>

              <button
                onClick={() => toggleMode("customer")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  chatMode === "customer"
                    ? "bg-brand-gold text-brand-darkMaroon shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Customer Mode</span>
              </button>
            </div>
          </div>

          {/* 2. Mode Context Banner */}
          <div className={`px-4 py-2 border-b text-xs flex items-center justify-between transition-colors ${
            chatMode === "customer" 
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          }`}>
            <span className="flex items-center gap-1.5 font-medium truncate">
              {chatMode === "customer" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Authenticated: <strong>Account #{account?.accountNumber || "0412345678"}</strong> ({account?.nickname || "Home"})</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Guest Mode: <strong>Public Knowledge Base</strong></span>
                </>
              )}
            </span>
            <button
              onClick={() => toggleMode(chatMode === "guest" ? "customer" : "guest")}
              className="text-[10px] font-bold text-brand-maroon dark:text-brand-gold hover:underline shrink-0 ml-2"
            >
              {chatMode === "guest" ? "Switch to Customer →" : "Switch to Guest →"}
            </button>
          </div>

          {/* 3. Conversation Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50 dark:bg-[#12161f]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.mode === "customer"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-brand-gold"
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === "user"
                      ? "bg-maroon-gradient text-white rounded-tr-none font-medium"
                      : "bg-white dark:bg-[#1A212D] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/90 dark:border-slate-800"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line text-xs">
                    {msg.content}
                  </p>

                  {/* RICH UI CARD: Bill Summary */}
                  {msg.richCard?.type === "bill" && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#141922] border border-brand-maroon/20 dark:border-brand-gold/20 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-maroon dark:text-brand-gold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{msg.richCard.data.billing_month || "October 2026"} Bill</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Due: {msg.richCard.data.due_date || "2026-11-25"}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Total Outstanding</span>
                        <span className="text-base font-extrabold text-brand-maroon dark:text-white">
                          {formatCurrency(msg.richCard.data.outstanding_balance || 4850.00)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setPaymentModalOpen(true)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-maroon-gradient text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-95 shadow-xs"
                        >
                          <CreditCard className="w-3 h-3 text-brand-gold" />
                          <span>Pay Now</span>
                        </button>
                        <button
                          onClick={() => setBillModalOpen(true)}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* RICH UI CARD: Consumption History */}
                  {msg.richCard?.type === "consumption" && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#141922] border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-brand-maroon dark:text-brand-gold" />
                          <span>Consumption Overview</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          142 kWh (Down 11.2%)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">6-Month Average: 154 kWh / month</p>
                      {msg.richCard.data.history && (
                        <div className="flex items-end justify-between gap-1 pt-2 h-14 border-t border-slate-200 dark:border-slate-800">
                          {msg.richCard.data.history.map((h: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full rounded-t bg-maroon-gradient"
                                style={{ height: `${Math.min(48, (h.kwh / 200) * 44)}px` }}
                              />
                              <span className="text-[9px] text-slate-400">{h.month}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* RICH UI CARD: Complaint Tracking */}
                  {msg.richCard?.type === "complaint" && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#141922] border border-amber-300 dark:border-amber-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{msg.richCard.data.ticket_id}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          {msg.richCard.data.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {msg.richCard.data.nature}
                      </p>
                      <div className="text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                        <div>Assigned: {msg.richCard.data.assigned_depot}</div>
                        <div>ETA: {msg.richCard.data.estimated_completion}</div>
                      </div>
                    </div>
                  )}

                  {/* RICH UI CARD: Solar Capacity */}
                  {msg.richCard?.type === "solar" && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#141922] border border-brand-gold/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Transformer {msg.richCard.data.transformer_code}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {msg.richCard.data.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Available Absorption: <strong>{msg.richCard.data.remaining_capacity_kw} kW</strong>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Total: {msg.richCard.data.total_capacity_kva} kVA | Feeder: {msg.richCard.data.feeder_name}
                      </p>
                    </div>
                  )}

                  {/* Action Button for Login Gate */}
                  {msg.actionRequired === "login" && chatMode === "guest" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setChatMode("customer")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-300" />
                        <span>Switch to Customer Mode</span>
                      </button>
                      <a
                        href="/login"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Customer Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* RAG Source Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>RAG Sources:</span>
                      </span>
                      {msg.sources.map((src, i) => (
                        <span 
                          key={i} 
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[9px] text-slate-400">
                    <span className="font-semibold text-brand-maroon dark:text-brand-gold">
                      {msg.mode === "customer" ? "Customer Scoped" : "Guest Scoped"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-slate-500 dark:text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-brand-maroon flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-[#1A212D] px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. Quick-Reply Chips for Active Mode */}
          <div className="px-3 pt-2.5 pb-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161B22] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-gold" />
                <span>{chatMode === "guest" ? "Guest Questions" : "Customer Questions"}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Click chip to test AI
              </span>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeQuickReplies.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleUserSend(q.text)}
                  className={`shrink-0 text-[11px] px-3 py-1.5 rounded-xl border transition-all shadow-xs ${
                    q.key === "guestBillCheck"
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold"
                      : "bg-slate-50 dark:bg-[#1A212D] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-maroon hover:text-brand-maroon dark:hover:border-brand-gold dark:hover:text-brand-gold"
                  }`}
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSend();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12161f] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={chatMode === "guest" 
                ? "Ask guest questions (e.g. tariffs, safety, outages)..."
                : "Ask customer questions (e.g. my bill, complaints, usage)..."
              }
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A212D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-xl bg-maroon-gradient text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 text-brand-gold" />
            </button>
          </form>
        </div>
      )}

      {/* 6. Option C Feature Comparison Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-brand-maroon flex items-center justify-center">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.chatbot.viewFeatureMatrix || "Option C Feature Comparison Matrix"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Option C Architecture — Strict Access Boundary Separation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                    <th className="py-2 px-2">Service Feature</th>
                    <th className="py-2 px-2 text-center">Guest Mode</th>
                    <th className="py-2 px-2 text-center">Customer Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  <tr>
                    <td className="py-2 px-2 font-medium">General Electricity FAQs</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Tariff Explanations</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Electrical Safety Guidance</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">General Outage Guidance</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Yes</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-2 px-2 font-medium text-brand-maroon dark:text-red-300">Personal Bill Details</td>
                    <td className="py-2 px-2 text-center text-red-600 dark:text-red-400 font-semibold">🔒 Login Req.</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Full Access</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-2 px-2 font-medium text-brand-maroon dark:text-red-300">Consumption History</td>
                    <td className="py-2 px-2 text-center text-red-600 dark:text-red-400 font-semibold">🔒 Login Req.</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Full Access</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-2 px-2 font-medium text-brand-maroon dark:text-red-300">Complaint Tracking</td>
                    <td className="py-2 px-2 text-center text-red-600 dark:text-red-400 font-semibold">🔒 Login Req.</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Full Access</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-2 px-2 font-medium text-brand-maroon dark:text-red-300">Personalized Assistance</td>
                    <td className="py-2 px-2 text-center text-red-600 dark:text-red-400 font-semibold">🔒 Login Req.</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-bold">✅ Full Access</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 rounded-xl bg-brand-maroon text-white text-xs font-bold hover:bg-brand-darkMaroon"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
