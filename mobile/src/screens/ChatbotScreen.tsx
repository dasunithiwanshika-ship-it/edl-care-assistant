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
import { Colors } from "../theme/colors";
import { sendChatMessageApi } from "../services/api";

interface ChatbotScreenProps {
  onNavigate: (screen: string) => void;
  accountNumber?: string;
  token?: string;
  initialMode?: "guest" | "customer";
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({
  onNavigate,
  accountNumber = "0412345678",
  token,
  initialMode = "customer"
}) => {
  const [mode, setMode] = useState<"guest" | "customer">(initialMode);
  const [language, setLanguage] = useState<"en" | "si" | "ta">("en");
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>("mob-sess-" + Math.random().toString(36).substring(2, 9));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initial welcome message
    const welcome = mode === "guest"
      ? "Ayubowan / Vanakkam! I am your EDL Care Assistant in Guest Mode. I can explain domestic tariffs, electrical safety protocols, and outage guidance. Sign in anytime to access personal bills."
      : `Ayubowan! Connected to Account #${accountNumber}. I can answer questions about your October bill (Rs. 4,850.00), consumption trends, or breakdown tracking.`;

    setMessages([
      {
        id: "msg-welcome",
        sender: "assistant",
        text: welcome,
        mode,
        sources: ["EDL Official Guidelines 2026"]
      }
    ]);
  }, [mode, language]);

  const guestChips = [
    "Explain electricity tariffs",
    "What is my bill balance?",
    "Electrical safety guidance",
    "Check outage info"
  ];

  const customerChips = [
    "Check my outstanding balance",
    "Why is my bill high?",
    "Compare with last month",
    "Track my complaint"
  ];

  const activeChips = mode === "guest" ? guestChips : customerChips;

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
        language,
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
        text: `⚠️ Communication error: ${err.message || "Unable to reach EDL Care backend."} Please check that the server is running on 0.0.0.0:8000.`,
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
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => onNavigate("dashboard")}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleCol}>
            <Text style={styles.headerTitle}>EDL Care Assistant</Text>
            <Text style={styles.headerSubtitle}>Google Gemini • ChromaDB RAG</Text>
          </View>
          {/* Language Switcher */}
          <View style={styles.langRow}>
            {(["en", "si", "ta"] as const).map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.langPill, language === l && styles.langPillActive]}
                onPress={() => setLanguage(l)}
              >
                <Text style={[styles.langText, language === l && styles.langTextActive]}>
                  {l.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Selector Pill */}
        <View style={styles.modeSwitchBar}>
          <TouchableOpacity
            style={[styles.modeTab, mode === "guest" && styles.modeTabActiveGuest]}
            onPress={() => setMode("guest")}
          >
            <Text style={[styles.modeTabText, mode === "guest" && styles.modeTabTextActive]}>
              🔓 Guest Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === "customer" && styles.modeTabActiveCust]}
            onPress={() => setMode("customer")}
          >
            <Text style={[styles.modeTabText, mode === "customer" && styles.modeTabTextActiveCust]}>
              🛡️ Customer Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scope Banner */}
      <View style={mode === "customer" ? styles.scopeBannerCust : styles.scopeBannerGuest}>
        <Text style={mode === "customer" ? styles.scopeTextCust : styles.scopeTextGuest}>
          {mode === "customer"
            ? `Verified Account #${accountNumber} • Full Personalized Access`
            : "Guest Mode • Public Knowledge Base Only (Personal Bills Gated)"}
        </Text>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgWrapper,
              m.sender === "user" ? styles.msgWrapperUser : styles.msgWrapperBot
            ]}
          >
            <View
              style={[
                styles.msgBubble,
                m.sender === "user" ? styles.msgBubbleUser : styles.msgBubbleBot
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  m.sender === "user" ? styles.msgTextUser : styles.msgTextBot
                ]}
              >
                {m.text}
              </Text>

              {/* Structured Response Card */}
              {m.richCard && (
                <View style={styles.richCardContainer}>
                  <View style={styles.richCardHeader}>
                    <Text style={styles.richCardTitle}>
                      {m.richCard.type === "bill" ? "💳" : m.richCard.type === "complaint" ? "🚨" : m.richCard.type === "solar" ? "☀️" : "📊"} {m.richCard.title || "Service Details"}
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

              {/* Action: Pay Now */}
              {m.actionRequired === "pay" && mode === "customer" && (
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnPay}
                    onPress={() => onNavigate("bill-details")}
                  >
                    <Text style={styles.actionBtnTextPay}>💳 Pay Outstanding Balance</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action: Login Required */}
              {m.actionRequired === "login" && mode === "guest" && (
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnLogin}
                    onPress={() => setMode("customer")}
                  >
                    <Text style={styles.actionBtnTextLogin}>🛡️ Switch to Customer Mode</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* RAG Citations */}
              {m.sources && m.sources.length > 0 && (
                <View style={styles.sourcesRow}>
                  <Text style={styles.sourcesLabel}>📚 Sources: </Text>
                  {m.sources.map((s: string, idx: number) => (
                    <Text key={idx} style={styles.sourceTag}>
                      {s}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={Colors.primaryMaroon} />
            <Text style={styles.typingText}>EDL AI is reasoning...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Reply Suggestion Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeChips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chipBtn}
              onPress={() => handleSend(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={mode === "guest" ? "Ask guest questions..." : "Ask customer questions..."}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    backgroundColor: Colors.primaryMaroon,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  titleCol: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 1,
  },
  langRow: {
    flexDirection: "row",
    gap: 4,
  },
  langPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  langPillActive: {
    backgroundColor: Colors.gold,
  },
  langText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  langTextActive: {
    color: Colors.darkMaroon,
  },
  modeSwitchBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    padding: 3,
    marginTop: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
  },
  modeTabActiveGuest: {
    backgroundColor: "#FFFFFF",
  },
  modeTabActiveCust: {
    backgroundColor: Colors.gold,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.8)",
  },
  modeTabTextActive: {
    color: Colors.primaryMaroon,
  },
  modeTabTextActiveCust: {
    color: Colors.darkMaroon,
  },
  scopeBannerCust: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#A7F3D0",
  },
  scopeTextCust: {
    color: "#065F46",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  scopeBannerGuest: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  scopeTextGuest: {
    color: "#4B5563",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  msgWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  msgWrapperUser: {
    justifyContent: "flex-end",
  },
  msgWrapperBot: {
    justifyContent: "flex-start",
  },
  msgBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  msgBubbleUser: {
    backgroundColor: Colors.primaryMaroon,
    borderBottomRightRadius: 4,
  },
  msgBubbleBot: {
    backgroundColor: Colors.cardLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextUser: {
    color: "#FFFFFF",
  },
  msgTextBot: {
    color: Colors.textPrimary,
  },
  cardActionRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtnPay: {
    backgroundColor: Colors.primaryMaroon,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnTextPay: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  actionBtnLogin: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnTextLogin: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  sourcesRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  sourcesLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: "bold",
  },
  sourceTag: {
    fontSize: 9,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    color: Colors.textSecondary,
    marginRight: 4,
    marginTop: 2,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  typingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  chipsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  chipBtn: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: Colors.primaryMaroon,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  richCardContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  richCardHeader: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  richCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
  },
  richCardBody: {
    padding: 10,
  },
  richCardMain: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  richCardSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  richCardBtn: {
    backgroundColor: Colors.primaryMaroon,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  richCardBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
});
