import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Power Breakdown</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Emergency Alert Banner */}
      <View style={styles.emergencyBanner}>
        <Text style={styles.emergencyIcon}>⚡</Text>
        <View style={styles.emergencyTextCol}>
          <Text style={styles.emergencyTitle}>24/7 Breakdown Hotline: 1987</Text>
          <Text style={styles.emergencyDesc}>
            For fallen wires, sparking poles, or electrical hazards, dial 1987 immediately.
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
        />

        <Text style={styles.fieldLabel}>Contact Telephone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.fieldLabel}>Nature of Fault / Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={nature}
          onChangeText={setNature}
          placeholder="Describe the power interruption or issue observed..."
          multiline={true}
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.submitBtn}
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
          <Text style={styles.ticketTitle}>Active Ticket Reference</Text>
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
        <TextInput
          style={styles.searchHistoryInput}
          placeholder="Search by Reference # (e.g. CMP-041-001)..."
          value={searchRef}
          onChangeText={setSearchRef}
        />

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primaryMaroon,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emergencyBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991B1B",
  },
  emergencyDesc: {
    fontSize: 11,
    color: "#7F1D1D",
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
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
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: Colors.textSecondary,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.backgroundLight,
  },
  catBtnActive: {
    backgroundColor: Colors.primaryMaroon,
    borderColor: Colors.primaryMaroon,
  },
  catBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  catBtnTextActive: {
    color: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: Colors.primaryMaroon,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  ticketCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },
  ticketTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
  },
  ticketNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#78350F",
    marginVertical: 4,
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B45309",
  },
  ticketEta: {
    fontSize: 11,
    color: "#92400E",
    marginTop: 2,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  searchHistoryInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyRef: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusInProgress: {
    backgroundColor: "#DBEAFE",
  },
  statusResolved: {
    backgroundColor: "#D1FAE5",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
  },
  historyCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  historyDesc: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
