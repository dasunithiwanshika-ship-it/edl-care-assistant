import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { Colors } from "./src/theme/colors";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ChatbotScreen } from "./src/screens/ChatbotScreen";
import { OutageMapScreen } from "./src/screens/OutageMapScreen";
import { BillDetailsScreen } from "./src/screens/BillDetailsScreen";
import { ConsumptionScreen } from "./src/screens/ConsumptionScreen";
import { ComplaintsScreen } from "./src/screens/ComplaintsScreen";
import { SolarScreen } from "./src/screens/SolarScreen";
import { LoginScreen } from "./src/screens/LoginScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("dashboard");
  const [token, setToken] = useState<string | undefined>("edl_demo_token_dasuni_2026");
  const [accountNumber, setAccountNumber] = useState<string>("0412345678");
  const [isGuest, setIsGuest] = useState<boolean>(false);

  const handleLoginSuccess = (userToken: string, accNum: string) => {
    setToken(userToken);
    setAccountNumber(accNum);
    setIsGuest(false);
    setCurrentScreen("dashboard");
  };

  const handleContinueAsGuest = () => {
    setToken(undefined);
    setIsGuest(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setToken(undefined);
    setIsGuest(true);
    setCurrentScreen("login");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onContinueAsGuest={handleContinueAsGuest}
          />
        );
      case "dashboard":
        return (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            token={token}
            isGuest={isGuest}
          />
        );
      case "chatbot":
        return (
          <ChatbotScreen
            onNavigate={setCurrentScreen}
            accountNumber={accountNumber}
          />
        );
      case "outages":
        return <OutageMapScreen onNavigate={setCurrentScreen} />;
      case "bill-details":
        return <BillDetailsScreen onNavigate={setCurrentScreen} token={token} />;
      case "consumption":
        return <ConsumptionScreen onNavigate={setCurrentScreen} token={token} />;
      case "complaints":
        return <ComplaintsScreen onNavigate={setCurrentScreen} accountNumber={accountNumber} />;
      case "solar":
        return <SolarScreen onNavigate={setCurrentScreen} />;
      default:
        return (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            token={token}
            isGuest={isGuest}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkMaroon} />
      <View style={styles.container}>{renderScreen()}</View>

      {/* Global Bottom Tab Bar (shown when not on login screen) */}
      {currentScreen !== "login" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen("dashboard")}
          >
            <Text style={styles.tabIcon}>⚡</Text>
            <Text style={[styles.tabLabel, currentScreen === "dashboard" && styles.tabLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen("outages")}
          >
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text style={[styles.tabLabel, currentScreen === "outages" && styles.tabLabelActive]}>
              Outages
            </Text>
          </TouchableOpacity>

          {/* Center Chat Assistant Bubble */}
          <TouchableOpacity
            style={styles.centerChatBubble}
            onPress={() => setCurrentScreen("chatbot")}
          >
            <Text style={styles.centerChatIcon}>🤖</Text>
            <Text style={styles.centerChatLabel}>AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen("complaints")}
          >
            <Text style={styles.tabIcon}>🚨</Text>
            <Text style={[styles.tabLabel, currentScreen === "complaints" && styles.tabLabelActive]}>
              Breakdown
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => (isGuest ? setCurrentScreen("login") : handleLogout())}
          >
            <Text style={styles.tabIcon}>{isGuest ? "🔑" : "👤"}</Text>
            <Text style={[styles.tabLabel, currentScreen === "login" && styles.tabLabelActive]}>
              {isGuest ? "Sign In" : "Profile"}
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
    backgroundColor: Colors.darkMaroon,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primaryMaroon,
    fontWeight: "bold",
  },
  centerChatBubble: {
    backgroundColor: Colors.primaryMaroon,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  centerChatIcon: {
    fontSize: 20,
  },
  centerChatLabel: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 1,
  },
});
