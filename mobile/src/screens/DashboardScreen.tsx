import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
import { Colors } from "../theme/colors";
import { getCustomerProfileApi, getBillsApi, payBillApi } from "../services/api";

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
      {/* Top Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>
            {isGuest ? "Welcome, Guest Visitor" : `Ayubowan, ${profile?.full_name?.split(" ")[0] || "Customer"}`}
          </Text>
          <Text style={styles.subGreetingText}>
            {isGuest ? "Public Utility Demonstration" : "Electricity Distribution Lanka"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.chatHeaderBtn}
          onPress={() => onNavigate("chatbot")}
        >
          <Text style={styles.chatHeaderBtnText}>⚡ AI Help</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Account Card (Maroon Gradient Style) */}
      <View style={styles.accountCard}>
        <View style={styles.accountCardTop}>
          <View>
            <Text style={styles.accountCardLabel}>ELECTRICITY SERVICE ACCOUNT</Text>
            <Text style={styles.accountNumberText}>
              #{profile?.account_number || "0412345678"}
            </Text>
          </View>
          <View style={styles.badgeHome}>
            <Text style={styles.badgeHomeText}>HOME</Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Outstanding Balance</Text>
          <Text style={styles.balanceAmount}>
            Rs. {Number(profile?.outstanding_balance || 4850).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.dueDateText}>Payment Due: {profile?.due_date || "25 Nov 2026"}</Text>
        </View>

        {/* Card Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={() => setPayModalVisible(true)}
          >
            <Text style={styles.payNowBtnText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.billDetailsBtn}
            onPress={() => onNavigate("bill-details")}
          >
            <Text style={styles.billDetailsBtnText}>Bill Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Consumption Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Monthly Consumption</Text>
          <Text style={styles.trendGreen}>-11.2% this month</Text>
        </View>
        <Text style={styles.consumptionUnits}>
          {profile?.monthly_consumption_kwh || 142} <Text style={styles.unitKwh}>kWh</Text>
        </Text>
        <Text style={styles.averageNote}>
          6-Month Average: {profile?.monthly_average_kwh || 154} kWh/mo
        </Text>

        <TouchableOpacity
          style={styles.viewHistoryBtn}
          onPress={() => onNavigate("consumption")}
        >
          <Text style={styles.viewHistoryBtnText}>View 6-Month Usage Chart →</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Alert: Feeder Breakdown */}
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() => onNavigate("outages")}
      >
        <View style={styles.alertIconCol}>
          <Text style={styles.alertIcon}>⚠️</Text>
        </View>
        <View style={styles.alertTextCol}>
          <Text style={styles.alertTitle}>Feeder F-04 Havelock</Text>
          <Text style={styles.alertSubtitle}>
            Breakdown under active crew repair • Est. Rest: Today 04:30 PM
          </Text>
        </View>
      </TouchableOpacity>

      {/* Quick Services Grid */}
      <Text style={styles.quickServicesTitle}>Quick Services</Text>
      <View style={styles.servicesGrid}>
        <TouchableOpacity
          style={styles.serviceItem}
          onPress={() => onNavigate("outages")}
        >
          <Text style={styles.serviceIcon}>🗺️</Text>
          <Text style={styles.serviceItemTitle}>Outage Map</Text>
          <Text style={styles.serviceItemDesc}>Live Grid Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceItem}
          onPress={() => onNavigate("complaints")}
        >
          <Text style={styles.serviceIcon}>🚨</Text>
          <Text style={styles.serviceItemTitle}>Breakdown</Text>
          <Text style={styles.serviceItemDesc}>Report & Track</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceItem}
          onPress={() => onNavigate("solar")}
        >
          <Text style={styles.serviceIcon}>☀️</Text>
          <Text style={styles.serviceItemTitle}>Solar Capacity</Text>
          <Text style={styles.serviceItemDesc}>Feeder Quotas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceItem}
          onPress={() => onNavigate("chatbot")}
        >
          <Text style={styles.serviceIcon}>🤖</Text>
          <Text style={styles.serviceItemTitle}>AI Assistant</Text>
          <Text style={styles.serviceItemDesc}>Multilingual Help</Text>
        </TouchableOpacity>
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
              <Text style={styles.qrIcon}>📱</Text>
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
    backgroundColor: Colors.backgroundLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  subGreetingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chatHeaderBtn: {
    backgroundColor: Colors.primaryMaroon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatHeaderBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  accountCard: {
    backgroundColor: Colors.primaryMaroon,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  accountCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountCardLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  accountNumberText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  badgeHome: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeHomeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.gold,
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  payNowBtn: {
    flex: 1,
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  payNowBtnText: {
    color: Colors.darkMaroon,
    fontWeight: "bold",
    fontSize: 13,
  },
  billDetailsBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  billDetailsBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
  trendGreen: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "bold",
  },
  consumptionUnits: {
    fontSize: 24,
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
    marginTop: 12,
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
    backgroundColor: "#FEE2E2",
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
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceItem: {
    width: "48%",
    backgroundColor: Colors.cardLight,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
