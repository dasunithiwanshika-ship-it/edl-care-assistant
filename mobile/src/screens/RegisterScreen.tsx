import React, { useState } from "react";
import {
  View,
  Text,
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
import { registerApi } from "../services/api";
import { EDLCareLogo } from "../components/EDLCareLogo";

interface RegisterProps {
  onRegisterSuccess: (token: string, accountNum: string) => void;
  onNavigateToLogin: () => void;
  onContinueAsGuest: () => void;
}

export const RegisterScreen: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onContinueAsGuest
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Enter a valid email address (e.g. name@example.com).";
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone number is required.";
    } else if (!/^(\+?\d{9,15})$/.test(cleanPhone)) {
      errors.phone = "Enter a valid phone number (e.g. 0771234567).";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerApi({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
      });

      Alert.alert(
        "Account Created Successfully",
        `Welcome to EDLCare, ${res.full_name || fullName}!\n\nYour new 10-digit utility account number is:\n#${res.account_number}\n\nYou are now signed in.`,
        [
          {
            text: "Open Dashboard",
            onPress: () => onRegisterSuccess(res.access_token, res.account_number),
          },
        ]
      );
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please check your details.";
      setErrorMessage(msg);
      Alert.alert("Registration Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Criteria
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

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
        {/* Top Header Banner matching EDL Mobile Theme */}
        <View style={styles.topMaroonBanner}>
          <View style={styles.logoWrapper}>
            <EDLCareLogo variant="badge" size={64} style={styles.logoBadge} />
          </View>
          <Text style={styles.bannerSubtitle}>Electricity Distribution Lanka</Text>
          <Text style={styles.bannerTitle}>Create New Account</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Customer Registration</Text>
          <Text style={styles.cardSubtitle}>
            Register for 24/7 access to itemized bills, consumption analytics & grid telemetry.
          </Text>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Field 1: Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <View style={[styles.inputWrapper, fieldErrors.fullName ? styles.inputErrorBorder : null]}>
            <Ionicons name="person-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
              }}
              placeholder="e.g. Dasuni Thiwanshika"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>
          {fieldErrors.fullName ? <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text> : null}

          {/* Field 2: Email Address */}
          <Text style={styles.label}>Email Address *</Text>
          <View style={[styles.inputWrapper, fieldErrors.email ? styles.inputErrorBorder : null]}>
            <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="e.g. dasuni@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}

          {/* Field 3: Phone Number */}
          <Text style={styles.label}>Phone Number *</Text>
          <View style={[styles.inputWrapper, fieldErrors.phone ? styles.inputErrorBorder : null]}>
            <Ionicons name="call-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
              }}
              placeholder="e.g. 0771234567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
          {fieldErrors.phone ? <Text style={styles.fieldErrorText}>{fieldErrors.phone}</Text> : null}

          {/* Field 4: Password */}
          <Text style={styles.label}>Password (Min. 6 Characters) *</Text>
          <View style={[styles.inputWrapper, fieldErrors.password ? styles.inputErrorBorder : null]}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
              }}
              secureTextEntry={!showPassword}
              placeholder="At least 6 characters"
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
          {fieldErrors.password ? <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text> : null}

          {/* Password strength indicators */}
          <View style={styles.strengthRow}>
            <View style={styles.strengthPill}>
              <Ionicons
                name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                size={12}
                color={hasMinLength ? "#10B981" : "#94A3B8"}
              />
              <Text style={[styles.strengthText, hasMinLength && styles.strengthTextActive]}>6+ chars</Text>
            </View>
            <View style={styles.strengthPill}>
              <Ionicons
                name={hasLetter ? "checkmark-circle" : "ellipse-outline"}
                size={12}
                color={hasLetter ? "#10B981" : "#94A3B8"}
              />
              <Text style={[styles.strengthText, hasLetter && styles.strengthTextActive]}>Letters</Text>
            </View>
            <View style={styles.strengthPill}>
              <Ionicons
                name={hasNumber ? "checkmark-circle" : "ellipse-outline"}
                size={12}
                color={hasNumber ? "#10B981" : "#94A3B8"}
              />
              <Text style={[styles.strengthText, hasNumber && styles.strengthTextActive]}>Numbers</Text>
            </View>
          </View>

          {/* Field 5: Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={[styles.inputWrapper, fieldErrors.confirmPassword ? styles.inputErrorBorder : null]}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              secureTextEntry={!showConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
          ) : passwordsMatch ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600" }}>Passwords match</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Create Account</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Link to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginRowText}>Already registered? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginRowLink}>Sign In to Account</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Link */}
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
    paddingTop: Platform.OS === "ios" ? 18 : 22,
    paddingHorizontal: 20,
    paddingBottom: 38,
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
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoBadge: {
    borderRadius: 16,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -22,
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
    marginBottom: 5,
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
  inputErrorBorder: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  fieldErrorText: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 3,
    marginLeft: 2,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#1E293B",
  },
  eyeBtn: {
    padding: 6,
  },
  strengthRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  strengthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  strengthText: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "500",
  },
  strengthTextActive: {
    color: "#10B981",
    fontWeight: "700",
  },
  submitBtn: {
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
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  loginRowText: {
    fontSize: 12.5,
    color: "#64748B",
  },
  loginRowLink: {
    fontSize: 12.5,
    color: "#650B24",
    fontWeight: "bold",
  },
  guestLink: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 6,
  },
  guestLinkText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
});
