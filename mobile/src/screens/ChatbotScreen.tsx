import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import type { ScrollViewInstance } from "react-native";
import { Colors } from "../theme/colors";
import { sendChatMessageApi } from "../services/api";
import { EDLCareLogo } from "../components/EDLCareLogo";

interface ChatbotScreenProps {
  onNavigate: (screen: string) => void;
  accountNumber?: string;
  token?: string;
  isGuest?: boolean;
  initialMode?: "guest" | "customer";
}

const FormattedChatMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <Text style={[styles.msgText, styles.msgTextUser]}>{text}</Text>;
  }

  // Parse inline formatting: **bold** and *italic*
  const renderInline = (raw: string, baseStyle: any, keyPrefix: string) => {
    // Regex splits on **bold**
    const boldParts = raw.split(/(\*\*.*?\*\*)/g);
    return (
      <Text style={baseStyle}>
        {boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length >= 4) {
            const inner = bPart.slice(2, -2);
            return (
              <Text key={`${keyPrefix}-b-${bIdx}`} style={{ fontWeight: "700", color: "#111827" }}>
                {inner}
              </Text>
            );
          }
          // Split on *italic*
          const italicParts = bPart.split(/(\*.*?\*)/g);
          return italicParts.map((iPart, iIdx) => {
            if (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length >= 2) {
              return (
                <Text key={`${keyPrefix}-i-${bIdx}-${iIdx}`} style={{ fontStyle: "italic", fontWeight: "600", color: "#650B24" }}>
                  {iPart.slice(1, -1)}
                </Text>
              );
            }
            return iPart;
          });
        })}
      </Text>
    );
  };

  const lines = (text || "").split("\n");

  return (
    <View style={{ gap: 4 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={idx} style={{ height: 4 }} />;
        }

        // Headings: ###, ##, #
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
          const headingContent = headingMatch[2];
          return (
            <View key={idx} style={{ marginTop: 6, marginBottom: 2 }}>
              {renderInline(headingContent, styles.markdownHeading, `h-${idx}`)}
            </View>
          );
        }

        // Bullet lists: * or - or •
        const bulletMatch = trimmed.match(/^[\*\-\•]\s+(.+)$/);
        if (bulletMatch) {
          const bulletContent = bulletMatch[1];
          return (
            <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", paddingLeft: 4, marginVertical: 1 }}>
              <Text style={{ fontSize: 13, color: "#650B24", marginRight: 6, lineHeight: 22 }}>•</Text>
              <View style={{ flex: 1 }}>
                {renderInline(bulletContent, [styles.msgText, styles.msgTextBot], `bl-${idx}`)}
              </View>
            </View>
          );
        }

        // Numbered list: 1. 2. etc
        const numberedMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2];
          return (
            <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", paddingLeft: 4, marginVertical: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#650B24", marginRight: 6, lineHeight: 22 }}>
                {num}
              </Text>
              <View style={{ flex: 1 }}>
                {renderInline(content, [styles.msgText, styles.msgTextBot], `nl-${idx}`)}
              </View>
            </View>
          );
        }

        // Standard text line
        return (
          <View key={idx} style={{ marginVertical: 1 }}>
            {renderInline(trimmed, [styles.msgText, styles.msgTextBot], `p-${idx}`)}
          </View>
        );
      })}
    </View>
  );
};

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({
  onNavigate,
  accountNumber = "0412345678",
  token,
  isGuest = true,
  initialMode
}) => {
  const isAuthenticated = Boolean(token && !isGuest);
  const mode = initialMode || (isAuthenticated ? "customer" : "guest");

  const welcomeText = isAuthenticated
    ? `Ayubowan! Connected to Account #${accountNumber}. How can I assist you today with your billing, electricity usage, solar, or outage queries?`
    : "Ayubowan! I am your EDL Assistant. You can ask me anything about electricity tariffs, power outages, rooftop solar schemes, energy-saving tips, or electrical safety guidelines. If you need personal bill records or complaint status, sign in anytime!";

  const sampleQuestions = isAuthenticated
    ? [
        "Check my outstanding balance",
        "Explain electricity tariffs",
        "How can I save electricity?",
        "Compare with last month",
        "Solar net-metering info",
        "Track my complaint"
      ]
    : [
        "Explain electricity tariffs",
        "How can I save electricity?",
        "Check power outages",
        "Solar net-metering info",
        "What is my bill balance?",
        "Electrical safety tips"
      ];

  const [messages, setMessages] = useState<any[]>([
    {
      id: "initial-msg",
      sender: "assistant",
      text: welcomeText,
      mode
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>("mob-sess-" + Math.random().toString(36).substring(2, 9));
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    const userMsg = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: textToSend,
      mode
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText("");
    setIsTyping(true);

    try {
      const res = await sendChatMessageApi(
        textToSend,
        mode,
        "en",
        accountNumber,
        sessionIdRef.current,
        token
      );

      const botMsg = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        text: res.reply,
        mode: res.mode,
        actionRequired: res.action_required,
        sources: res.sources || [],
        richCard: res.rich_card
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        text: err.message || "Sorry, I am having trouble connecting to the EDL Assistant server right now. Please try again.",
        mode
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />

      {/* Top Rounded Header Container */}
      <View style={styles.header}>
        {/* Navigation Bar Row */}
        <View style={styles.navRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => onNavigate("dashboard")}
          >
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Grid Button Pill */}
          <TouchableOpacity
            style={styles.gridPill}
            activeOpacity={0.8}
            onPress={() => onNavigate("dashboard")}
          >
            <Ionicons name="grid" size={16} color="#FFFFFF" />
            <Text style={styles.gridPillText}>Grid</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section (Left-aligned) */}
        <View style={styles.heroSection}>
          {/* Glowing Robot Orb Avatar */}
          <View style={styles.avatarOrbWrapper}>
            <EDLCareLogo variant="circle" size={82} />
          </View>

          {/* Subtitle */}
          <Text style={styles.heroSubtitle}>Your AI assistant for EDL services</Text>

          {/* Main Title */}
          <Text style={styles.heroTitle}>EDL Assistant</Text>
        </View>
      </View>

      {/* Chat Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline Divider Pill: "Just now" */}
        <View style={styles.timelineDivider}>
          <View style={styles.timelineLine} />
          <View style={styles.timelinePill}>
            <Text style={styles.timelineText}>Just now</Text>
          </View>
          <View style={styles.timelineLine} />
        </View>

        {/* Messages Stream */}
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgWrapper,
              m.sender === "user" ? styles.msgWrapperUser : styles.msgWrapperBot
            ]}
          >
            {m.sender === "assistant" && (
              <View style={styles.botAvatarBadge}>
                <EDLCareLogo variant="bubble-avatar" size={38} />
              </View>
            )}

            <View
              style={[
                styles.msgBubble,
                m.sender === "user" ? styles.msgBubbleUser : styles.msgBubbleBot
              ]}
            >
              <FormattedChatMessage text={m.text} isUser={m.sender === "user"} />

              {/* Rich Service Card (if applicable) */}
              {m.richCard && (
                <View style={styles.richCardContainer}>
                  <View style={styles.richCardHeader}>
                    <Ionicons
                      name={
                        m.richCard.type === "bill"
                          ? "receipt-outline"
                          : m.richCard.type === "complaint"
                          ? "alert-circle-outline"
                          : m.richCard.type === "solar"
                          ? "sunny-outline"
                          : "stats-chart-outline"
                      }
                      size={15}
                      color="#650B24"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.richCardTitle}>
                      {m.richCard.title || "Service Details"}
                    </Text>
                  </View>
                  {m.richCard.type === "bill" && (
                    <View style={styles.richCardBody}>
                      <Text style={styles.richCardMain}>
                        Rs. {Number(m.richCard.data.total_amount || m.richCard.data.outstanding_balance || 4850).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                      <Text style={styles.richCardSub}>Due Date: {m.richCard.data.due_date || "25 Nov 2026"}</Text>
                      <TouchableOpacity style={styles.richCardBtn} onPress={() => onNavigate("bill-details")}>
                        <Text style={styles.richCardBtnText}>View Itemized Bill →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {m.richCard.type === "complaint" && (
                    <View style={styles.richCardBody}>
                      <Text style={styles.richCardMain}>Ticket #{m.richCard.data.reference_number || "CMP-041-001"}</Text>
                      <Text style={styles.richCardSub}>Status: {m.richCard.data.status || "IN_PROGRESS"}</Text>
                      <TouchableOpacity style={styles.richCardBtn} onPress={() => onNavigate("complaints")}>
                        <Text style={styles.richCardBtnText}>Track Complaint →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {m.richCard.type === "solar" && (
                    <View style={styles.richCardBody}>
                      <Text style={styles.richCardMain}>{m.richCard.data.available_capacity_kw || m.richCard.data.remaining_capacity_kw || 42} kW Capacity</Text>
                      <Text style={styles.richCardSub}>Transformer: {m.richCard.data.transformer_code || "TR-402"}</Text>
                      <TouchableOpacity style={styles.richCardBtn} onPress={() => onNavigate("solar")}>
                        <Text style={styles.richCardBtnText}>Solar Feasibility →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              {m.actionRequired === "pay" && isAuthenticated && (
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnPay}
                    onPress={() => onNavigate("bill-details")}
                  >
                    <Ionicons name="card-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnTextPay}>Pay Outstanding Balance</Text>
                  </TouchableOpacity>
                </View>
              )}

              {m.actionRequired === "login" && (
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnLogin}
                    activeOpacity={0.85}
                    onPress={() => onNavigate("login")}
                  >
                    <Ionicons name="log-in-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnTextLogin}>Sign In to Customer Account</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.botAvatarBadge}>
              <EDLCareLogo variant="bubble-avatar" size={38} />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#650B24" />
              <Text style={styles.typingText}>EDL Assistant is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sample Questions / Quick Suggestion Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {sampleQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chipBtn}
              activeOpacity={0.7}
              onPress={() => handleSend(q)}
            >
              <Ionicons name="sparkles-outline" size={13} color="#650B24" style={{ marginRight: 6 }} />
              <Text style={styles.chipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Floating Bottom Input Bar */}
      <View style={styles.bottomBarWrapper}>
        <View style={styles.inputCard}>
          {/* Attachment Icon */}
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Ionicons name="attach-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>

          {/* Input Field */}
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isAuthenticated ? "Ask about bills, usage, or EDL..." : "Ask about tariffs, outages, solar..."}
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />

          {/* Maroon Send Button */}
          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.8}
            onPress={() => handleSend()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F7",
  },
  header: {
    backgroundColor: "#650B24",
    paddingTop: Platform.OS === "ios" ? 14 : 16,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  gridPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  gridPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  heroSection: {
    alignItems: "flex-start",
    paddingTop: 4,
  },
  avatarOrbWrapper: {
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 13.5,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatScrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  timelineDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  timelinePill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 16,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  msgWrapper: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-start",
  },
  msgWrapperUser: {
    justifyContent: "flex-end",
  },
  msgWrapperBot: {
    justifyContent: "flex-start",
  },
  botAvatarBadge: {
    marginRight: 10,
    marginTop: 2,
  },
  msgBubble: {
    maxWidth: "82%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
  },
  msgBubbleUser: {
    backgroundColor: "#650B24",
    borderBottomRightRadius: 4,
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  msgBubbleBot: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTextUser: {
    color: "#FFFFFF",
  },
  msgTextBot: {
    color: "#1E293B",
  },
  markdownHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#650B24",
    lineHeight: 22,
  },
  richCardContainer: {
    marginTop: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  richCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  richCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#650B24",
  },
  richCardBody: {
    gap: 2,
  },
  richCardMain: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  richCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  richCardBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  richCardBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#650B24",
  },
  cardActionRow: {
    marginTop: 10,
  },
  actionBtnPay: {
    flexDirection: "row",
    backgroundColor: "#650B24",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnTextPay: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionBtnLogin: {
    flexDirection: "row",
    backgroundColor: "#650B24",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnTextLogin: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typingText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  chipsWrapper: {
    paddingVertical: 6,
    backgroundColor: "#F4F4F7",
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 12.5,
    color: "#1E293B",
    fontWeight: "500",
  },
  bottomBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#F4F4F7",
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
  },
  sendBtn: {
    backgroundColor: "#650B24",
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
