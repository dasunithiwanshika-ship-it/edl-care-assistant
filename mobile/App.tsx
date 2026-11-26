import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  LogBox,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Suppress known deprecation warning for react-native built-in SafeAreaView
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);
import { StatusBar } from "expo-status-bar";
import { Colors } from "./src/theme/colors";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ChatbotScreen } from "./src/screens/ChatbotScreen";
import { OutageMapScreen } from "./src/screens/OutageMapScreen";
import { BillDetailsScreen } from "./src/screens/BillDetailsScreen";
import { ConsumptionScreen } from "./src/screens/ConsumptionScreen";
import { ComplaintsScreen } from "./src/screens/ComplaintsScreen";
import { SolarScreen } from "./src/screens/SolarScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { EDLCareLogo } from "./src/components/EDLCareLogo";
import { setSessionExpiredHandler } from "./src/services/api";
import {
  saveAuthToken,
  getAuthToken,
  saveSessionData,
  getSessionData,
  clearAllAuthSession
} from "./src/services/storage";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("dashboard");
  const [token, setToken] = useState<string | undefined>(undefined);
  const [accountNumber, setAccountNumber] = useState<string>("0412345678");
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Restore saved session from SecureStore on startup
  useEffect(() => {
    // Configure automatic session expiry handler
    setSessionExpiredHandler(() => {
      setToken(undefined);
      setIsGuest(true);
      Alert.alert("Session Expired", "Your login session has expired. Please sign in again.");
      setCurrentScreen("login");
    });

    async function restoreSession() {
      try {
        const savedToken = await getAuthToken();
        const { accountNumber: savedAcc } = await getSessionData();

        if (savedToken && savedAcc) {
          setToken(savedToken);
          setAccountNumber(savedAcc);
          setIsGuest(false);
          setCurrentScreen("dashboard");
        } else {
          // Default to Guest Mode with quick demo access
          setIsGuest(true);
          setToken(undefined);
          setCurrentScreen("dashboard");
        }
      } catch (err) {
        console.warn("Session restore error:", err);
      } finally {
        setIsReady(true);
      }
    }
    restoreSession();
  }, []);

  const handleLoginSuccess = async (userToken: string, accNum: string) => {
    setToken(userToken);
    setAccountNumber(accNum);
    setIsGuest(false);
    await saveAuthToken(userToken);
    await saveSessionData(accNum);
    setCurrentScreen("dashboard");
  };

  const handleContinueAsGuest = async () => {
    await clearAllAuthSession();
    setToken(undefined);
    setIsGuest(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    await clearAllAuthSession();
    setToken(undefined);
    setIsGuest(true);
    setCurrentScreen("login");
  };

  const renderProtectedPrompt = (title: string, desc: string, icon: any) => (
    <View style={styles.protectedPromptContainer}>
      <View style={styles.protectedCard}>
        <View style={styles.protectedIconCircle}>
          <Ionicons name={icon} size={36} color="#650B24" />
        </View>
        <Text style={styles.protectedTitle}>{title}</Text>
        <Text style={styles.protectedSubtitle}>{desc}</Text>

        <TouchableOpacity
          style={styles.protectedPrimaryBtn}
          activeOpacity={0.85}
          onPress={() => setCurrentScreen("login")}
        >
          <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.protectedPrimaryBtnText}>Sign In to Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.protectedSecondaryBtn}
          activeOpacity={0.85}
          onPress={() => setCurrentScreen("register")}
        >
          <Ionicons name="person-add-outline" size={18} color="#650B24" style={{ marginRight: 6 }} />
          <Text style={styles.protectedSecondaryBtnText}>Create New Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.protectedBackLink}
          onPress={() => setCurrentScreen("dashboard")}
        >
          <Text style={styles.protectedBackLinkText}>← Return to Public Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen("register")}
            onContinueAsGuest={handleContinueAsGuest}
            onOpenGuestChat={() => {
              setIsGuest(true);
              setToken(undefined);
              setCurrentScreen("chatbot");
            }}
          />
        );
      case "register":
        return (
          <RegisterScreen
            onRegisterSuccess={handleLoginSuccess}
            onNavigateToLogin={() => setCurrentScreen("login")}
            onContinueAsGuest={handleContinueAsGuest}
          />
        );
      case "dashboard":
        return (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            token={token}
            isGuest={isGuest}
            accountNumber={accountNumber}
          />
        );
      case "chatbot":
        return (
          <ChatbotScreen
            onNavigate={setCurrentScreen}
            accountNumber={accountNumber}
            token={token}
            isGuest={isGuest}
            initialMode={!isGuest && Boolean(token) ? "customer" : "guest"}
          />
        );
      case "outages":
        return <OutageMapScreen onNavigate={setCurrentScreen} />;
      case "bill-details":
        if (isGuest || !token) {
          return renderProtectedPrompt(
            "Account Sign In Required",
            "Viewing itemized billing statements, tariffs, and payment records requires an authenticated EDL customer account.",
            "receipt-outline"
          );
        }
        return (
          <BillDetailsScreen
            onNavigate={setCurrentScreen}
            token={token}
            accountNumber={accountNumber}
          />
        );
      case "consumption":
        if (isGuest || !token) {
          return renderProtectedPrompt(
            "Consumption Analytics Restricted",
            "Your 12-month electricity consumption trends and historical usage are protected. Please sign in to view.",
            "stats-chart-outline"
          );
        }
        return (
          <ConsumptionScreen
            onNavigate={setCurrentScreen}
            token={token}
            accountNumber={accountNumber}
          />
        );
      case "complaints":
        return (
          <ComplaintsScreen
            onNavigate={setCurrentScreen}
            accountNumber={accountNumber}
            token={token}
            isGuest={isGuest}
          />
        );
      case "solar":
        return (
          <SolarScreen
            onNavigate={setCurrentScreen}
            accountNumber={accountNumber}
          />
        );
      default:
        return (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            token={token}
            isGuest={isGuest}
            accountNumber={accountNumber}
          />
        );
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: Colors.darkMaroon }]}>
          <EDLCareLogo variant="badge" size={76} style={{ marginBottom: 16 }} />
          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13, letterSpacing: 0.5 }}>
            EDL CARE ASSISTANT
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>{renderScreen()}</View>

      {/* Global Bottom Tab Bar (hidden during login, registration or chatbot) */}
      {currentScreen !== "login" && currentScreen !== "register" && currentScreen !== "chatbot" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen("dashboard")}
          >
            <Ionicons
              name={currentScreen === "dashboard" ? "home" : "home-outline"}
              size={22}
              color={currentScreen === "dashboard" ? Colors.primaryMaroon : "#8E8E93"}
            />
            <Text style={[styles.tabLabel, currentScreen === "dashboard" && styles.tabLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen("outages")}
          >
            <Ionicons
              name={currentScreen === "outages" ? "map" : "map-outline"}
              size={22}
              color={currentScreen === "outages" ? Colors.primaryMaroon : "#8E8E93"}
            />
            <Text style={[styles.tabLabel, currentScreen === "outages" && styles.tabLabelActive]}>
              Outages
            </Text>
          </TouchableOpacity>

          {/* Center Raised Chat Assistant Bubble */}
          <TouchableOpacity
            style={styles.centerChatBubble}
            activeOpacity={0.85}
            onPress={() => setCurrentScreen("chatbot")}
          >
            <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
            <Text style={styles.centerChatLabel}>AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen("complaints")}
          >
            <Ionicons
              name={currentScreen === "complaints" ? "warning" : "warning-outline"}
              size={22}
              color={currentScreen === "complaints" ? Colors.primaryMaroon : "#8E8E93"}
            />
            <Text style={[styles.tabLabel, currentScreen === "complaints" && styles.tabLabelActive]}>
              Breakdown
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => (isGuest ? setCurrentScreen("login") : handleLogout())}
          >
            <Ionicons
              name={isGuest ? "log-in-outline" : "log-out-outline"}
              size={22}
              color="#8E8E93"
            />
            <Text style={styles.tabLabel}>
              {isGuest ? "Sign In" : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#650B24",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F4F7",
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: "#8E8E93",
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: "#650B24",
    fontWeight: "700",
  },
  centerChatBubble: {
    backgroundColor: "#650B24",
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    elevation: 8,
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  centerChatLabel: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 1,
    letterSpacing: 0.3,
  },
  protectedPromptContainer: {
    flex: 1,
    backgroundColor: "#F4F4F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  protectedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  protectedIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FDF2F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(101, 11, 36, 0.15)",
  },
  protectedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  protectedSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  protectedPrimaryBtn: {
    backgroundColor: "#650B24",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 2,
  },
  protectedPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  protectedSecondaryBtn: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#650B24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  protectedSecondaryBtnText: {
    color: "#650B24",
    fontSize: 14,
    fontWeight: "bold",
  },
  protectedBackLink: {
    paddingVertical: 6,
  },
  protectedBackLinkText: {
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600",
  },
});
