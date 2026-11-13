import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { ClientLayoutShell } from "@/components/ClientLayoutShell";
import { PayNowModal } from "@/components/modals/PayNowModal";
import { BillDetailsModal } from "@/components/modals/BillDetailsModal";
import { ReportBreakdownModal } from "@/components/modals/ReportBreakdownModal";
import { BillCalculatorModalWrapper } from "@/components/modals/BillCalculatorModalWrapper";
import { ScheduleModalWrapper } from "@/components/modals/ScheduleModalWrapper";
import { SolarCapacityModalWrapper } from "@/components/modals/SolarCapacityModalWrapper";
import { EBillModalWrapper } from "@/components/modals/EBillModalWrapper";
import { ChatbotDrawer } from "@/features/chatbot/ChatbotDrawer";

export const metadata: Metadata = {
  title: "EDLCare Web Portal – Electricity Distribution Lanka",
  description: "Official inspired EDLCare Customer Self-Service Portal & AI Assistant prototype.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col bg-[#f8fafc] dark:bg-[#0c0f14] text-slate-900 dark:text-[#e2e8f0]">
        <AppProvider>
          <ClientLayoutShell>
            {children}
          </ClientLayoutShell>
          <PayNowModal />
          <BillDetailsModal />
          <ReportBreakdownModal />
          <BillCalculatorModalWrapper />
          <ScheduleModalWrapper />
          <SolarCapacityModalWrapper />
          <EBillModalWrapper />
          <ChatbotDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
