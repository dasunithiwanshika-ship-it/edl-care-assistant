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
  Info
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { ChatMessage, Language } from "@/types";

export const ChatbotDrawer: React.FC = () => {
  const { 
    isChatOpen, 
    setIsChatOpen, 
    language, 
    setLanguage, 
    t, 
    initialChatQuery, 
    setInitialChatQuery 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        sender: "assistant",
        content: t.chatbot.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        isMockResponse: true,
      },
    ]);
  }, [language, t.chatbot.welcomeMsg]);

  // Handle incoming query from external trigger
  useEffect(() => {
    if (initialChatQuery && isChatOpen) {
      handleUserSend(initialChatQuery);
      setInitialChatQuery(null);
    }
  }, [initialChatQuery, isChatOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickQuestions = [
    { key: "highBill", text: t.chatbot.quickReplies.highBill, answer: t.chatbot.mockAnswers.highBill },
    { key: "outageArea", text: t.chatbot.quickReplies.outageArea, answer: t.chatbot.mockAnswers.outageArea },
    { key: "reportBreakdown", text: t.chatbot.quickReplies.reportBreakdown, answer: t.chatbot.mockAnswers.reportBreakdown },
    { key: "solarCapacity", text: t.chatbot.quickReplies.solarCapacity, answer: t.chatbot.mockAnswers.solarCapacity },
  ];

  const handleUserSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: language,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Find best match in mock responses
    let matchedAnswer = t.chatbot.mockAnswers.defaultFallback;
    const lower = text.toLowerCase();

    if (lower.includes("bill") || lower.includes("high") || lower.includes("cost") || lower.includes("බිල") || lower.includes("கட்டணம்")) {
      matchedAnswer = t.chatbot.mockAnswers.highBill;
    } else if (lower.includes("outage") || lower.includes("power") || lower.includes("light") || lower.includes("ඇනහිට") || lower.includes("தடை")) {
      matchedAnswer = t.chatbot.mockAnswers.outageArea;
    } else if (lower.includes("breakdown") || lower.includes("report") || lower.includes("spark") || lower.includes("දෝෂ") || lower.includes("புகார்")) {
      matchedAnswer = t.chatbot.mockAnswers.reportBreakdown;
    } else if (lower.includes("solar") || lower.includes("capacity") || lower.includes("transformer") || lower.includes("සූර්ය") || lower.includes("சூரிய")) {
      matchedAnswer = t.chatbot.mockAnswers.solarCapacity;
    }

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        content: matchedAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        isMockResponse: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "assistant",
        content: t.chatbot.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: language,
        isMockResponse: true,
      },
    ]);
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
            <span className="text-xs font-bold leading-tight">
              {t.chatbot.title}
            </span>
            <span className="text-[10px] text-red-200 leading-tight">
              AI Support Online
            </span>
          </div>
        </button>
      )}

      {/* Slide-over Chatbot Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#27313B] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-maroon-gradient text-white p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6 text-brand-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-tight">
                    {t.chatbot.title}
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-gold text-brand-darkMaroon">
                    Mock AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-red-200">
                    {t.chatbot.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector Dropdown in Chat */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-white/20 focus:outline-none cursor-pointer"
                title="Change Chat Language"
              >
                <option value="en" className="text-black">EN</option>
                <option value="si" className="text-black">සිංහල</option>
                <option value="ta" className="text-black">தமிழ்</option>
              </select>

              {/* Reset History */}
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Demonstration Notice Strip */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40 px-3 py-1.5 text-[10px] text-amber-800 dark:text-amber-300 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-600 shrink-0" />
              {t.chatbot.disclaimer}
            </span>
          </div>

          {/* Conversation History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-brand-maroon dark:text-brand-gold flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-maroon-gradient text-white rounded-tr-none font-medium"
                      : "bg-gray-100 dark:bg-[#1E2530] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700/60"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[9px] opacity-70">
                    {msg.isMockResponse && (
                      <span className="font-semibold text-brand-maroon dark:text-brand-gold">
                        Demo Response
                      </span>
                    )}
                    <span className="ml-auto">{msg.timestamp}</span>
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-brand-maroon flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 dark:bg-[#1E2530] px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-maroon animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-3 pt-2 pb-1 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#13171d]/50 shrink-0">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
              {t.chatbot.suggestedQuestionsTitle}
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {quickQuestions.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleUserSend(q.text)}
                  className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1a212b] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-maroon hover:text-brand-maroon dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors shadow-xs"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSend();
            }}
            className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161B22] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.chatbot.inputPlaceholder}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a212b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-xl bg-maroon-gradient text-white hover:opacity-95 disabled:opacity-40 transition-opacity shadow-sm"
              title={t.chatbot.send}
            >
              <Send className="w-4 h-4 text-brand-gold" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
