import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { getCustomerProfileApi, getBillsApi, payBillApi } from "../services/api";
import { EDLCareLogo } from "../components/EDLCareLogo";

interface DashboardProps {
  onNavigate: (screen: string) => void;
  token?: string;
  isGuest?: boolean;
  accountNumber?: string;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
  onNavigate,
  token,
  isGuest
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [paid, setPaid] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    getCustomerProfileApi(token)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load customer profile");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handlePayNow = async () => {
    setPaid(true);
    const amountToPay = profile?.outstanding_balance || 4850.0;
    try {
      const res = await payBillApi(amountToPay, token, "LankaQR");
      setPayModalVisible(false);
      Alert.alert(
        "Payment Confirmed",
        `Receipt: ${res.transaction_id}\nAmount: Rs. ${Number(res.amount_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })}\nNew Balance: Rs. ${Number(res.new_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      );
      if (profile) {
        setProfile({ ...profile, outstanding_balance: res.new_balance });
      }
    } catch (err: any) {
      setPayModalVisible(false);
      Alert.alert(
        "Payment Failed",
        err.message || "Payment request failed. Please check server connectivity."
      );
    } finally {
      setPaid(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryMaroon} />
        <Text style={styles.loadingText}>Loading EDL Customer Services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Rounded Header Container */}
      <View style={styles.header}>
        {/* Navigation Bar Row */}
        <View style={styles.navRow}>
          <View style={styles.headerUserRow}>
            {/* User Account Avatar / Icon */}
            <View style={styles.userAvatarCircle}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subGreetingText}>
                {isGuest ? "Public Utility Demonstration" : "Electricity Distribution Lanka"}
              </Text>
              <Text style={styles.greetingTextLarge}>
                {isGuest ? "Welcome, Guest" : `Ayubowan, ${profile?.full_name?.split(" ")[0] || "Dasuni"}`}
              </Text>
            </View>
          </View>

          {/* AI Assistant Pill */}
          <TouchableOpacity
            style={styles.chatHeaderBtn}
            activeOpacity={0.8}
            onPress={() => onNavigate("chatbot")}
          >
            <Ionicons name="sparkles" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.chatHeaderBtnText}>AI Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Smaller Account Number Row */}
        <View style={styles.accountInfoRow}>
          <View style={styles.accountPill}>
            <Ionicons name="card-outline" size={13} color="rgba(255, 255, 255, 0.85)" style={{ marginRight: 6 }} />
            <Text style={styles.accountLabel}>ACCOUNT </Text>
            <Text style={styles.accountNumberSmall}>#{profile?.account_number || "0412345678"}</Text>
          </View>
          <View style={styles.badgeHome}>
            <Text style={styles.badgeHomeText}>HOME</Text>
          </View>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Primary Account Card (Crisp White Floating Card) */}
        <View style={styles.accountCard}>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Total Outstanding Balance</Text>
            <Text style={styles.balanceAmount}>
              Rs. {Number(profile?.outstanding_balance || 4850).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.dueRow}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.dueDateText}>Payment Due: {profile?.due_date || "25 Nov 2026"}</Text>
            </View>
          </View>

          {/* Card Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.payNowBtn}
              activeOpacity={0.85}
              onPress={() => setPayModalVisible(true)}
            >
              <Ionicons name="wallet-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.payNowBtnText}>Pay Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.billDetailsBtn}
              activeOpacity={0.85}
              onPress={() => onNavigate("bill-details")}
            >
              <Ionicons name="receipt-outline" size={15} color="#650B24" style={{ marginRight: 6 }} />
              <Text style={styles.billDetailsBtnText}>Bill Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Consumption Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="analytics" size={16} color="#650B24" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Monthly Consumption</Text>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-down" size={12} color="#10B981" style={{ marginRight: 3 }} />
              <Text style={styles.trendGreen}>-11.2% this month</Text>
            </View>
          </View>
          <Text style={styles.consumptionUnits}>
            {profile?.monthly_consumption_kwh || 142} <Text style={styles.unitKwh}>kWh</Text>
          </Text>
          <Text style={styles.averageNote}>
            6-Month Average: {profile?.monthly_average_kwh || 154} kWh/mo
          </Text>

          <TouchableOpacity
            style={styles.viewHistoryBtn}
            activeOpacity={0.7}
            onPress={() => onNavigate("consumption")}
          >
            <Text style={styles.viewHistoryBtnText}>View 6-Month Usage Chart</Text>
            <Ionicons name="arrow-forward" size={14} color="#650B24" />
          </TouchableOpacity>
        </View>

        {/* Grid Alert: Feeder Breakdown */}
        <TouchableOpacity
          style={styles.alertCard}
          activeOpacity={0.85}
          onPress={() => onNavigate("outages")}
        >
          <View style={styles.alertIconCol}>
            <Ionicons name="warning" size={22} color="#DC2626" />
          </View>
          <View style={styles.alertTextCol}>
            <Text style={styles.alertTitle}>Feeder F-04 Havelock</Text>
            <Text style={styles.alertSubtitle}>
              Breakdown under active crew repair • Est. Rest: Today 04:30 PM
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Quick Services Grid */}
        <Text style={styles.quickServicesTitle}>Quick Services</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity
            style={styles.serviceItem}
            activeOpacity={0.8}
            onPress={() => onNavigate("outages")}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="map" size={24} color="#2563EB" />
            </View>
            <Text style={styles.serviceItemTitle}>Outage Map</Text>
            <Text style={styles.serviceItemDesc}>Live Grid Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceItem}
            activeOpacity={0.8}
            onPress={() => onNavigate("complaints")}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="flash-off" size={24} color="#DC2626" />
            </View>
            <Text style={styles.serviceItemTitle}>Breakdown</Text>
            <Text style={styles.serviceItemDesc}>Report & Track</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceItem}
            activeOpacity={0.8}
            onPress={() => onNavigate("solar")}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="sunny" size={24} color="#D97706" />
            </View>
            <Text style={styles.serviceItemTitle}>Solar Capacity</Text>
            <Text style={styles.serviceItemDesc}>Feeder Quotas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceItem}
            activeOpacity={0.8}
            onPress={() => onNavigate("chatbot")}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: "#FDF2F4" }]}>
              <Ionicons name="sparkles" size={24} color="#650B24" />
            </View>
            <Text style={styles.serviceItemTitle}>AI Assistant</Text>
            <Text style={styles.serviceItemDesc}>Multilingual Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Demonstration Modal */}
      <Modal
        visible={payModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Simulated LankaQR Gateway</Text>
            <Text style={styles.modalAccount}>
              Account #{profile?.account_number || "0412345678"}
            </Text>
            <Text style={styles.modalAmount}>
              Rs. {Number(profile?.outstanding_balance || 4850).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>

            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={38} color={Colors.primaryMaroon} style={{ marginBottom: 6 }} />
              <Text style={styles.qrLabel}>Scan with any LankaQR Banking App</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmPayBtn}
              onPress={handlePayNow}
              disabled={paid}
            >
              <Text style={styles.confirmPayBtnText}>
                {paid ? "Processing Payment..." : "Confirm Demonstration Payment"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelPayBtn}
              onPress={() => setPayModalVisible(false)}
            >
              <Text style={styles.cancelPayBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F7",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
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
  headerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  userAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  greetingTextLarge: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  subGreetingText: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
    fontWeight: "500",
  },
  chatHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chatHeaderBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  accountInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  accountPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  accountNumberSmall: {
    fontSize: 13.5,
    color: "#FFFFFF",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  bodyContent: {
    padding: 16,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  badgeHome: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  badgeHomeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceSection: {
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#650B24",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: "#64748B",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  payNowBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#650B24",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  payNowBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  billDetailsBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F4F7",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(101, 11, 36, 0.15)",
  },
  billDetailsBtnText: {
    color: "#650B24",
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendGreen: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "bold",
  },
  consumptionUnits: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
    marginTop: 8,
  },
  unitKwh: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "normal",
  },
  averageNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  viewHistoryBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewHistoryBtnText: {
    fontSize: 12,
    color: Colors.primaryMaroon,
    fontWeight: "bold",
  },
  alertCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertIconCol: {
    marginRight: 10,
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 10,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991B1B",
  },
  alertSubtitle: {
    fontSize: 11,
    color: "#7F1D1D",
    marginTop: 2,
  },
  quickServicesTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  serviceItem: {
    width: "48%",
    backgroundColor: Colors.cardLight,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  serviceItemTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  serviceItemDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  modalAccount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
    marginTop: 8,
  },
  qrPlaceholder: {
    backgroundColor: Colors.backgroundLight,
    width: 140,
    height: 140,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  qrIcon: {
    fontSize: 48,
  },
  qrLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
  confirmPayBtn: {
    backgroundColor: Colors.primaryMaroon,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmPayBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  cancelPayBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  cancelPayBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
