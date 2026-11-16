import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { Colors } from "../theme/colors";
import { loginApi } from "../services/api";

interface LoginProps {
  onLoginSuccess: (token: string, accountNum: string) => void;
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [username, setUsername] = useState("0412345678");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginApi(username, password);
      onLoginSuccess(res.access_token, res.account_number);
    } catch {
      Alert.alert("Error", "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (acc: string, pass: string = "demo123") => {
    setUsername(acc);
    setPassword(pass);
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topMaroonBanner}>
        <Text style={styles.logoBadge}>⚡ EDL CARE</Text>
        <Text style={styles.bannerTitle}>Electricity Distribution Lanka</Text>
        <Text style={styles.bannerSubtitle}>Customer Portal & AI Assistant Prototype</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Customer Sign In</Text>
        <Text style={styles.cardSubtitle}>Access personal bills, usage history & complaints</Text>

        <Text style={styles.label}>Account Number or Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="e.g. 0412345678 or customer_low"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholder="demo123"
        />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In to Account</Text>
          )}
        </TouchableOpacity>

        {/* Quick Demo Credentials */}
        <Text style={styles.quickFillTitle}>Quick-Fill Demonstration Accounts</Text>
        <View style={styles.demoButtonsCol}>
          <TouchableOpacity
            style={styles.demoAccBtn}
            onPress={() => fillDemoAccount("0412345678")}
          >
            <Text style={styles.demoAccBtnText}>#0412345678 • Low Usage (Rs. 4,850)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoAccBtn}
            onPress={() => fillDemoAccount("0723456789")}
          >
            <Text style={styles.demoAccBtnText}>#0723456789 • High Usage (Rs. 18,200)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoAccBtn}
            onPress={() => fillDemoAccount("0134567890")}
          >
            <Text style={styles.demoAccBtnText}>#0134567890 • Solar Net-Metering (5 kW)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guestLink} onPress={onContinueAsGuest}>
          <Text style={styles.guestLinkText}>Continue as Guest Visitor →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  topMaroonBanner: {
    backgroundColor: Colors.primaryMaroon,
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  logoBadge: {
    backgroundColor: Colors.gold,
    color: Colors.darkMaroon,
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.cardLight,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  loginBtn: {
    backgroundColor: Colors.primaryMaroon,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  quickFillTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  demoButtonsCol: {
    gap: 6,
  },
  demoAccBtn: {
    backgroundColor: Colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  demoAccBtnText: {
    fontSize: 11,
    color: Colors.primaryMaroon,
    fontWeight: "600",
    textAlign: "center",
  },
  guestLink: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 6,
  },
  guestLinkText: {
    color: Colors.primaryMaroon,
    fontSize: 12,
    fontWeight: "bold",
  },
});
