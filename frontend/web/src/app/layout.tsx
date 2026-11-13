import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatbotDrawer } from "@/features/chatbot/ChatbotDrawer";
import { PayNowModal } from "@/components/modals/PayNowModal";
import { BillDetailsModal } from "@/components/modals/BillDetailsModal";
import { ReportBreakdownModal } from "@/components/modals/ReportBreakdownModal";
import { ClientLayoutShell } from "@/components/ClientLayoutShell";

export const metadata: Metadata = {
  title: "EDL Care Assistant – AI-Powered Customer Support System",
  description: "Independent demonstration prototype for Electricity Distribution Lanka (EDL), Sri Lanka.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col bg-surface-bg dark:bg-[#0c0f14] text-surface-textPrimary dark:text-[#e6edf3]">
        <AppProvider>
          <ClientLayoutShell>
            {children}
          </ClientLayoutShell>
          <PayNowModal />
          <BillDetailsModal />
          <ReportBreakdownModal />
          <ChatbotDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
