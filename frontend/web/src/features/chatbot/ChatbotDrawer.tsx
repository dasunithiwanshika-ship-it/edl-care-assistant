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
  HelpCircle
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { ChatMessage, Language, ChatMode } from "@/types";
import { formatCurrency } from "@/lib/utils";

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
        isMockResponse: true,
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
    { key: "understandBill", text: t.chatbot.quickReplies.understandBill, answer: t.chatbot.mockAnswers.understandBill },
    { key: "tariffExpl", text: t.chatbot.quickReplies.tariffExpl, answer: t.chatbot.mockAnswers.tariffExpl },
    { key: "safetyGuide", text: t.chatbot.quickReplies.safetyGuide, answer: t.chatbot.mockAnswers.safetyGuide },
    { key: "generalOutage", text: t.chatbot.quickReplies.generalOutage, answer: t.chatbot.mockAnswers.generalOutage },
    { key: "guestBillCheck", text: t.chatbot.quickReplies.guestBillCheck, answer: t.chatbot.mockAnswers.guestBillCheck, action: "login" as const },
  ];

  const customerQuickReplies = [
    { key: "myBill", text: t.chatbot.quickReplies.myBill, answer: t.chatbot.mockAnswers.myBill, action: "pay" as const },
    { key: "myConsumption", text: t.chatbot.quickReplies.myConsumption, answer: t.chatbot.mockAnswers.myConsumption },
    { key: "trackComplaint", text: t.chatbot.quickReplies.trackComplaint, answer: t.chatbot.mockAnswers.trackComplaint },
    { key: "mySolar", text: t.chatbot.quickReplies.mySolar, answer: t.chatbot.mockAnswers.mySolar },
  ];

  const activeQuickReplies = chatMode === "guest" ? guestQuickReplies : customerQuickReplies;

  const handleUserSend = (textToSend?: string) => {
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

    const lower = text.toLowerCase();
    let matchedAnswer = t.chatbot.mockAnswers.defaultFallback;
    let actionReq: 'login' | 'pay' | 'bill-details' | 'complaint' | undefined = undefined;

    // OPTION C GATE ENFORCEMENT
    if (chatMode === "guest") {
      // If a guest requests personal bill / account information
      if (
        lower.includes("outstanding") || 
        lower.includes("my bill") || 
        lower.includes("balance") || 
        lower.includes("මගේ බිල") || 
        lower.includes("ශේෂය") || 
        lower.includes("நிலுவை")
      ) {
        matchedAnswer = t.chatbot.mockAnswers.guestBillCheck;
        actionReq = "login";
      } else if (lower.includes("understand") || lower.includes("how can i understand") || lower.includes("තේරුම්") || lower.includes("புரிந்து")) {
        matchedAnswer = t.chatbot.mockAnswers.understandBill;
      } else if (lower.includes("tariff") || lower.includes("rate") || lower.includes("ගාස්තු") || lower.includes("கட்டண முறை")) {
        matchedAnswer = t.chatbot.mockAnswers.tariffExpl;
      } else if (lower.includes("safety") || lower.includes("precaution") || lower.includes("hazard") || lower.includes("ආරක්ෂ") || lower.includes("பாதுகாப்பு")) {
        matchedAnswer = t.chatbot.mockAnswers.safetyGuide;
      } else if (lower.includes("outage") || lower.includes("power") || lower.includes("light") || lower.includes("ඇනහිට") || lower.includes("மின்தடை")) {
        matchedAnswer = t.chatbot.mockAnswers.generalOutage;
      } else if (lower.includes("solar") || lower.includes("සූර්ය") || lower.includes("சூரிய")) {
        matchedAnswer = t.chatbot.mockAnswers.solarCapacity;
      } else if (lower.includes("breakdown") || lower.includes("report") || lower.includes("දෝෂ") || lower.includes("புகார்")) {
        matchedAnswer = t.chatbot.mockAnswers.reportBreakdown;
      }
    } else {
      // CUSTOMER MODE: Full personalized access
      if (
        lower.includes("outstanding") || 
        lower.includes("my bill") || 
        lower.includes("balance") || 
        lower.includes("මගේ බිල") || 
        lower.includes("ශේෂය") || 
        lower.includes("நிலுவை")
      ) {
        matchedAnswer = t.chatbot.mockAnswers.myBill;
        actionReq = "pay";
      } else if (lower.includes("consumption") || lower.includes("usage") || lower.includes("kwh") || lower.includes("පරිභෝජන") || lower.includes("நுகர்வு")) {
        matchedAnswer = t.chatbot.mockAnswers.myConsumption;
      } else if (lower.includes("complaint") || lower.includes("track") || lower.includes("පැමිණිලි") || lower.includes("புகார்")) {
        matchedAnswer = t.chatbot.mockAnswers.trackComplaint;
      } else if (lower.includes("solar") || lower.includes("transformer") || lower.includes("සූර්ය") || lower.includes("சூரிய")) {
        matchedAnswer = t.chatbot.mockAnswers.mySolar;
      } else if (lower.includes("high") || lower.includes("why is my bill") || lower.includes("වැඩි වී")) {
        matchedAnswer = t.chatbot.mockAnswers.highBill;
      } else if (lower.includes("outage") || lower.includes("ඇනහිට")) {
        matchedAnswer = t.chatbot.mockAnswers.outageArea;
      } else if (lower.includes("report") || lower.includes("breakdown")) {
        matchedAnswer = t.chatbot.mockAnswers.reportBreakdown;
      }
    }

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        content: matchedAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        mode: chatMode,
        isMockResponse: true,
        actionRequired: actionReq,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleReset = () => {
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
        isMockResponse: true,
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[640px] max-h-[88vh] rounded-3xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  chatMode === "guest"
                    ? "bg-white text-[#6c002c] shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Guest Mode</span>
              </button>

              <button
                onClick={() => toggleMode("customer")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  chatMode === "customer"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>Customer Mode</span>
              </button>
            </div>
          </div>

          {/* 2. Active Mode Context Banner */}
          <div className={`px-3 py-1.5 text-[11px] flex items-center justify-between border-b shrink-0 transition-colors ${
            chatMode === "customer"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300"
              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          }`}>
            <span className="flex items-center gap-1.5 font-medium truncate">
              {chatMode === "customer" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Authenticated: <strong>Account #0412345678</strong> (Home)</span>
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
              className="text-[10px] font-bold text-[#6c002c] dark:text-amber-400 hover:underline shrink-0 ml-2"
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
                      : "bg-red-100 dark:bg-red-950/60 text-[#6c002c] dark:text-amber-400"
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === "user"
                      ? "bg-maroon-gradient text-white rounded-tr-none font-medium"
                      : "bg-white dark:bg-[#1A212D] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/90 dark:border-slate-800"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line text-xs">
                    {msg.content}
                  </p>

                  {/* Contextual Action Buttons in Assistant Messages */}
                  {msg.actionRequired === "pay" && chatMode === "customer" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#6c002c] hover:bg-[#550022] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CreditCard className="w-3 h-3 text-[#F8BB15]" />
                        <span>Pay Rs. 4,850.00</span>
                      </button>
                      <button
                        onClick={() => setBillModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Bill Details</span>
                      </button>
                    </div>
                  )}

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

                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[9px] text-slate-400">
                    <span className="font-semibold text-[#6c002c] dark:text-amber-400">
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
                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#6c002c] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-[#1A212D] px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6c002c] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#6c002c] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#6c002c] animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. Quick-Reply Chips for Active Mode */}
          <div className="px-3 pt-2.5 pb-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161B22] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F8BB15]" />
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
                      : "bg-slate-50 dark:bg-[#1A212D] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#6c002c] hover:text-[#6c002c] dark:hover:border-amber-400 dark:hover:text-amber-400"
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
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A212D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-xl bg-maroon-gradient text-white hover:opacity-95 disabled:opacity-40 transition-opacity shadow-xs"
              title={t.chatbot.send}
            >
              <Send className="w-4 h-4 text-brand-gold" />
            </button>
          </form>
        </div>
      )}

      {/* 6. Feature Matrix Popover / Modal (Option C Official Spec) */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#161B22] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6c002c]/10 text-[#6c002c] dark:bg-amber-400/10 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Option C: Dual Access Architecture
                  </h4>
                  <p className="text-xs text-slate-500">
                    Guest Mode vs Logged-In Customer Permission Scope
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Feature</th>
                    <th className="py-2.5 px-3 font-bold text-center">Guest</th>
                    <th className="py-2.5 px-3 font-bold text-center">Logged In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-medium">General electricity FAQs</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Tariff explanations</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Electrical safety guidance</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">General outage guidance</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="py-2 px-3 font-medium">Personal bill details</td>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">🔒 Login req.</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="py-2 px-3 font-medium">Personal consumption history</td>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">🔒 Login req.</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="py-2 px-3 font-medium">Personal complaint tracking</td>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">🔒 Login req.</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="py-2 px-3 font-medium">Personalized account assistance</td>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">🔒 Login req.</td>
                    <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Backend Permission Boundary:
              </span>
              <p>
                The shared Python FastAPI + Google Gemini backend enforces strict session scope separation. Guest queries retrieve only public domain RAG vectors. Authenticated sessions inject customer-specific mock records into the Gemini reasoning context.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-5 py-2 rounded-xl bg-[#6c002c] text-white text-xs font-bold hover:bg-[#550022] transition-colors"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
