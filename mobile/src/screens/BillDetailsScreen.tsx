import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { getBillsApi, payBillApi } from "../services/api";

interface BillDetailsProps {
  onNavigate: (screen: string) => void;
  token?: string;
  accountNumber?: string;
}

export const BillDetailsScreen: React.FC<BillDetailsProps> = ({
  onNavigate,
  token,
  accountNumber = "0412345678"
}) => {
  const [bills, setBills] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const fetchBills = () => {
    setLoading(true);
    setError(null);
    getBillsApi(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBills(data);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load billing history");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBills();
  }, [token]);

  const bill = bills[selectedIndex] || {
    billing_month: "October 2026",
    previous_reading: 1240,
    present_reading: 1382,
    units_consumed: 142,
    energy_charge: 3850.00,
    fixed_charge: 1000.00,
    fuel_adjustment: 0.00,
    total_amount: 4850.00,
    due_date: "2026-11-25",
    is_paid: false
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await payBillApi(bill.total_amount, token, "LankaQR", accountNumber);
      Alert.alert(
        "Payment Confirmed",
        `Receipt: ${res.transaction_id}\nAmount: Rs. ${Number(res.amount_paid).toFixed(2)}\nBill marked as PAID.`
      );
      setBills((prev) =>
        prev.map((b, idx) => (idx === selectedIndex ? { ...b, is_paid: true } : b))
      );
    } catch (err: any) {
      Alert.alert("Payment Failed", err.message || "Demonstration bill payment could not be processed.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#650B24" />
        <Text style={styles.loadingText}>Fetching itemized bill statement...</Text>
      </View>
    );
  }

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
          <Text style={styles.heroSubtitle}>ACCOUNT #{accountNumber} • {bill.billing_month || "October 2026"}</Text>
          <Text style={styles.heroTitle}>Itemized Bill</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Bill Cycle Selector */}
        {bills.length > 1 && (
          <View style={styles.cycleRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bills.map((b, idx) => (
                <TouchableOpacity
                  key={b.id || idx}
                  style={[styles.cycleBtn, selectedIndex === idx && styles.cycleBtnActive]}
                  onPress={() => setSelectedIndex(idx)}
                >
                  <Text style={[styles.cycleBtnText, selectedIndex === idx && styles.cycleBtnTextActive]}>
                    {b.billing_month || `Cycle #${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bill Overview Card */}
        <View style={styles.statementCard}>
          <View style={styles.statementHeader}>
            <View>
              <Text style={styles.accountText}>BILLING CYCLE</Text>
              <Text style={styles.monthLabel}>{bill.billing_month}</Text>
            </View>
            <View style={[styles.statusBadge, bill.is_paid ? styles.statusPaid : styles.statusUnpaid]}>
              <Text style={[styles.statusText, bill.is_paid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
                {bill.is_paid ? "PAID" : "UNPAID"}
              </Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.totalValue}>
              Rs. {Number(bill.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.dueLabel}>Due Date: {bill.due_date}</Text>
          </View>

          {!bill.is_paid && (
            <TouchableOpacity
              style={styles.payNowStatementBtn}
              activeOpacity={0.85}
              onPress={handlePay}
              disabled={paying}
            >
              <Ionicons name="wallet-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.payNowStatementBtnText}>
                {paying ? "Processing Payment..." : "Pay with LankaQR"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Meter Reading Telemetry Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Meter Reading Telemetry</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Previous Reading</Text>
            <Text style={styles.itemValue}>{bill.previous_reading || 1240} kWh</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Present Reading</Text>
            <Text style={styles.itemValue}>{bill.present_reading || 1382} kWh</Text>
          </View>
          <View style={[styles.itemRow, styles.itemRowHighlight]}>
            <Text style={styles.itemLabelBold}>Net Units Consumed</Text>
            <Text style={styles.itemValueBold}>{bill.units_consumed || 142} kWh</Text>
          </View>
        </View>

        {/* Tariff Charges Breakdown Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Tariff Charges Breakdown (D-1)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Energy Charges (Blocks 1–5)</Text>
            <Text style={styles.itemValue}>Rs. {Number(bill.energy_charge || 3850).toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Monthly Fixed Service Charge</Text>
            <Text style={styles.itemValue}>Rs. {Number(bill.fixed_charge || 1000).toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Fuel Adjustment Levy (FAS)</Text>
            <Text style={styles.itemValue}>Rs. {Number(bill.fuel_adjustment || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.itemRow, styles.itemRowHighlight]}>
            <Text style={styles.itemLabelBold}>Total Statement Amount</Text>
            <Text style={styles.itemValueBold}>
              Rs. {Number(bill.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
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
  cycleRow: {
    marginBottom: 14,
  },
  cycleBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cycleBtnActive: {
    backgroundColor: "#650B24",
    borderColor: "#650B24",
  },
  cycleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  cycleBtnTextActive: {
    color: "#FFFFFF",
  },
  statementCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  accountText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  monthLabel: {
    color: "#1E293B",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: "#D1FAE5",
  },
  statusUnpaid: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  statusTextPaid: {
    color: "#065F46",
  },
  statusTextUnpaid: {
    color: "#991B1B",
  },
  totalRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
  },
  totalLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  totalValue: {
    color: "#650B24",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 2,
  },
  dueLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  payNowStatementBtn: {
    flexDirection: "row",
    backgroundColor: "#650B24",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  payNowStatementBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#650B24",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  itemRowHighlight: {
    borderBottomWidth: 0,
    paddingTop: 10,
    marginTop: 4,
  },
  itemLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  itemValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  itemLabelBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
  },
  itemValueBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#650B24",
  },
});
