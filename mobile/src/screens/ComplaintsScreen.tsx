import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import { Colors } from "../theme/colors";

interface ComplaintsProps {
  onNavigate: (screen: string) => void;
  accountNumber?: string;
}

export const ComplaintsScreen: React.FC<ComplaintsProps> = ({
  onNavigate,
  accountNumber = "0412345678"
}) => {
  const [category, setCategory] = useState("Breakdown");
  const [area, setArea] = useState("Colombo 05");
  const [phone, setPhone] = useState("0771234567");
  const [nature, setNature] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!nature.trim()) {
      Alert.alert("Input Required", "Please enter the nature of the breakdown incident.");
      return;
    }

    const tkt = `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTicket(tkt);
    Alert.alert("Complaint Registered", `Ticket #${tkt} dispatched to the nearest Area Engineer Depot.`);
  };

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
          value={accountNumber}
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

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Breakdown Report</Text>
        </TouchableOpacity>
      </View>

      {/* Ticket Confirmation */}
      {submittedTicket && (
        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>Active Ticket Reference</Text>
          <Text style={styles.ticketNumber}>#{submittedTicket}</Text>
          <Text style={styles.ticketStatus}>Status: IN_PROGRESS (Crew Dispatched)</Text>
          <Text style={styles.ticketEta}>Estimated Restoration: Within 4 hours</Text>
        </View>
      )}
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
});
