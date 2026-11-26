import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { createComplaintApi, getComplaintsApi } from "../services/api";

interface ComplaintsProps {
  onNavigate: (screen: string) => void;
  accountNumber?: string;
  token?: string;
  isGuest?: boolean;
}

export const ComplaintsScreen: React.FC<ComplaintsProps> = ({
  onNavigate,
  accountNumber = "0412345678",
  token,
  isGuest
}) => {
  const [category, setCategory] = useState("Breakdown");
  const [area, setArea] = useState("Colombo 05");
  const [phone, setPhone] = useState("0771234567");
  const [nature, setNature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [searchRef, setSearchRef] = useState("");

  useEffect(() => {
    getComplaintsApi(token).then((data) => {
      if (Array.isArray(data)) setHistory(data);
    });
  }, [token]);

  const handleSubmit = async () => {
    if (!nature.trim()) {
      Alert.alert("Input Required", "Please enter the nature of the breakdown incident.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createComplaintApi(
        {
          category: category.toUpperCase(),
          description: nature.trim(),
          area: area.trim(),
          contact_phone: phone.trim(),
          priority: "HIGH"
        },
        token
      );

      setSubmittedTicket(res);
      setHistory((prev) => [res, ...prev]);
      setNature("");
      Alert.alert(
        "Complaint Registered",
        `Ticket #${res.reference_number} dispatched to the nearest Area Engineer Depot.`
      );
    } catch (err: any) {
      Alert.alert(
        "Submission Failed",
        err.message || "Failed to register breakdown report. Please check server connectivity."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = history.filter((h) =>
    searchRef.trim() === ""
      ? true
      : h.reference_number?.toLowerCase().includes(searchRef.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchRef.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Rounded Header Container */}
      <View style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => onNavigate("dashboard")}
          >
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridPill}
            activeOpacity={0.8}
            onPress={() => onNavigate("dashboard")}
          >
            <Ionicons name="grid" size={16} color="#FFFFFF" />
            <Text style={styles.gridPillText}>Grid</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroSubtitle}>24/7 BREAKDOWN DESK & INCIDENT LOGS</Text>
          <Text style={styles.heroTitle}>Power Breakdown</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Emergency Alert Banner */}
        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyIconCircle}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.emergencyTextCol}>
            <Text style={styles.emergencyTitle}>24/7 Emergency Hotline: 1987</Text>
            <Text style={styles.emergencyDesc}>
              For fallen high-voltage cables, sparking poles, or safety hazards, call 1987 immediately.
            </Text>
          </View>
        </View>

        {/* Complaint Form */}
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Electricity Service Account</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={isGuest ? "Guest (Unauthenticated)" : accountNumber}
            editable={false}
          />

          <Text style={styles.fieldLabel}>Incident Category</Text>
          <View style={styles.categoryRow}>
            {["Breakdown", "Voltage Drop", "Meter Fault"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                activeOpacity={0.7}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Affected Area / Premises Location</Text>
          <TextInput
            style={styles.input}
            value={area}
            onChangeText={setArea}
            placeholder="e.g. Havelock Town, Colombo 05"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Contact Telephone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Nature of Fault / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={nature}
            onChangeText={setNature}
            placeholder="Describe the power interruption or issue observed..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Breakdown Report</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ticket Confirmation */}
        {submittedTicket && (
          <View style={styles.ticketCard}>
            <View style={styles.ticketTopRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.ticketTitle}>Incident Ticket Registered</Text>
            </View>
            <Text style={styles.ticketNumber}>#{submittedTicket.reference_number}</Text>
            <Text style={styles.ticketStatus}>
              Status: {submittedTicket.status || "IN_PROGRESS"} (Dispatched)
            </Text>
            <Text style={styles.ticketEta}>Estimated Restoration: Within 4 hours</Text>
          </View>
        )}

        {/* Complaint History & Tracking */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Incident Tickets</Text>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchHistoryInput}
              placeholder="Search by Reference # (e.g. CMP-041-001)..."
              placeholderTextColor="#9CA3AF"
              value={searchRef}
              onChangeText={setSearchRef}
            />
          </View>

          {filteredHistory.map((item, idx) => (
            <View key={item.id || idx} style={styles.historyCard}>
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyRef}>#{item.reference_number}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "RESOLVED"
                      ? styles.statusResolved
                      : item.status === "IN_PROGRESS"
                      ? styles.statusInProgress
                      : styles.statusPending
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.historyCategory}>{item.category} • Priority: {item.priority || "NORMAL"}</Text>
              <Text style={styles.historyDesc}>{item.description}</Text>
              {item.created_at && (
                <Text style={styles.historyDate}>Logged: {new Date(item.created_at).toLocaleDateString()}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F7",
  },
  content: {
    paddingBottom: 40,
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
    marginBottom: 14,
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
    paddingTop: 2,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  bodyContent: {
    padding: 16,
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#DC2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emergencyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 2,
  },
  emergencyDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F4F4F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  inputDisabled: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: "#64748B",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  catBtn: {
    flex: 1,
    backgroundColor: "#F4F4F7",
    paddingVertical: 9,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  catBtnActive: {
    backgroundColor: "#650B24",
    borderColor: "#650B24",
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  catBtnTextActive: {
    color: "#FFFFFF",
  },
  submitBtn: {
    backgroundColor: "#650B24",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "bold",
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#065F46",
  },
  ticketNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 2,
  },
  ticketStatus: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  ticketEta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10B981",
    marginTop: 2,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchHistoryInput: {
    flex: 1,
    fontSize: 13,
    color: "#1E293B",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  historyRef: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#650B24",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusResolved: {
    backgroundColor: "#D1FAE5",
  },
  statusInProgress: {
    backgroundColor: "#FEF3C7",
  },
  statusPending: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1E293B",
  },
  historyCategory: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  historyDesc: {
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
