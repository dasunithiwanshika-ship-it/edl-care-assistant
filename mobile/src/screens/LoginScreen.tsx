import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { loginApi } from "../services/api";
import { EDLCareLogo } from "../components/EDLCareLogo";

interface LoginProps {
  onLoginSuccess: (token: string, accountNum: string) => void;
  onNavigateToRegister: () => void;
  onContinueAsGuest: () => void;
  onOpenGuestChat: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onContinueAsGuest,
  onOpenGuestChat
}) => {
  const [username, setUsername] = useState("0412345678");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!username.trim()) {
      setErrorMessage("Please enter your account number, username or email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password);
      onLoginSuccess(res.access_token, res.account_number);
    } catch (err: any) {
      const msg = err.message || "Invalid credentials. Please verify your details.";
      setErrorMessage(msg);
      Alert.alert("Authentication Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (acc: string, pass: string = "demo123") => {
    setUsername(acc);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F4F7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Banner with Official EDL Logo */}
        <View style={styles.topMaroonBanner}>
          <View style={styles.logoWrapper}>
            <EDLCareLogo variant="badge" size={68} style={styles.logoBadge} />
          </View>
          <Text style={styles.bannerSubtitle}>Electricity Distribution Lanka</Text>
          <Text style={styles.bannerTitle}>Customer Sign In</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Verified Account Access</Text>
          <Text style={styles.cardSubtitle}>
            Sign in with your Account Number, Username, or Registered Email Address.
          </Text>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Identifier Input */}
          <Text style={styles.label}>Account Number, Username or Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. 0412345678 or name@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input with Visibility Toggle */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry={!showPassword}
              placeholder="demo123"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.loginBtnText}>Sign In to Account</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Create an Account Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerRowText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.registerRowLink}>Create an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Credentials */}
          <Text style={styles.quickFillTitle}>Fast Demo Accounts (Click to Fill)</Text>
          <View style={styles.demoButtonsCol}>
            <TouchableOpacity
              style={styles.demoAccBtn}
              activeOpacity={0.7}
              onPress={() => fillDemoAccount("0412345678")}
            >
              <Text style={styles.demoAccBtnText}>#0412345678 • Low Usage (Rs. 4,850)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoAccBtn}
              activeOpacity={0.7}
              onPress={() => fillDemoAccount("0723456789")}
            >
              <Text style={styles.demoAccBtnText}>#0723456789 • High Usage (Rs. 18,200)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoAccBtn}
              activeOpacity={0.7}
              onPress={() => fillDemoAccount("0134567890")}
            >
              <Text style={styles.demoAccBtnText}>#0134567890 • Solar Net-Metering (5 kW)</Text>
            </TouchableOpacity>
          </View>

          {/* Ask AI Assistant Directly with Bot Face */}
          <TouchableOpacity
            style={styles.guestChatBtn}
            activeOpacity={0.8}
            onPress={onOpenGuestChat}
          >
            <Image
              source={require("../../assets/edl-robot-orb.png")}
              style={styles.botFaceIcon}
              resizeMode="contain"
            />
            <Text style={styles.guestChatBtnText}>Ask AI Assistant Directly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestLink}
            activeOpacity={0.7}
            onPress={onContinueAsGuest}
          >
            <Text style={styles.guestLinkText}>Continue to Public Dashboard →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F7",
  },
  topMaroonBanner: {
    backgroundColor: "#650B24",
    paddingTop: Platform.OS === "ios" ? 20 : 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logoWrapper: {
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoBadge: {
    borderRadius: 18,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1E293B",
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    backgroundColor: "#650B24",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  registerRowText: {
    fontSize: 12.5,
    color: "#64748B",
  },
  registerRowLink: {
    fontSize: 12.5,
    color: "#650B24",
    fontWeight: "bold",
  },
  quickFillTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#64748B",
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  demoButtonsCol: {
    gap: 8,
  },
  demoAccBtn: {
    backgroundColor: "#F4F4F7",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  demoAccBtnText: {
    fontSize: 11.5,
    color: "#650B24",
    fontWeight: "600",
    textAlign: "center",
  },
  guestChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(101, 11, 36, 0.15)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  botFaceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  guestChatBtnText: {
    color: "#650B24",
    fontSize: 13.5,
    fontWeight: "bold",
  },
  guestLink: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 6,
  },
  guestLinkText: {
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600",
  },
});
