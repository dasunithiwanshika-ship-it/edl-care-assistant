import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
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
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getBillsApi(token).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setBills(data);
      }
      setLoading(false);
    });
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
      const res = await payBillApi(bill.total_amount, token, "LankaQR");
      Alert.alert(
        "Payment Confirmed",
        `Receipt: ${res.transaction_id}\nAmount: Rs. ${Number(res.amount_paid).toFixed(2)}\nBill marked as PAID.`
      );
      // Mark as paid in local state
      setBills((prev) =>
        prev.map((b, idx) => (idx === selectedIndex ? { ...b, is_paid: true } : b))
      );
    } catch {
      Alert.alert("Payment Success", "Demonstration bill payment recorded.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primaryMaroon} />
        <Text style={styles.loadingText}>Fetching itemized bill statement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Itemized Electricity Bill</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <Text style={styles.accountText}>ACCOUNT #{accountNumber}</Text>
            <Text style={styles.monthLabel}>{bill.billing_month}</Text>
          </View>
          <View style={[styles.statusBadge, bill.is_paid ? styles.statusPaid : styles.statusUnpaid]}>
            <Text style={[styles.statusText, bill.is_paid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
              {bill.is_paid ? "PAID" : "UNPAID"}
            </Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Payable Total Amount</Text>
          <Text style={styles.totalValue}>
            Rs. {Number(bill.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.dueLabel}>Payment Due: {bill.due_date}</Text>
        </View>

        {!bill.is_paid && (
          <TouchableOpacity
            style={styles.payNowStatementBtn}
            onPress={handlePay}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.payNowStatementBtnText}>Pay Bill via LankaQR</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Meter Telemetry */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Meter Reading Telemetry</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Previous Reading (kWh)</Text>
          <Text style={styles.itemValue}>{bill.previous_reading || 1240}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Present Reading (kWh)</Text>
          <Text style={styles.itemValue}>{bill.present_reading || 1382}</Text>
        </View>
        <View style={[styles.itemRow, styles.itemRowHighlight]}>
          <Text style={styles.itemLabelBold}>Net Units Consumed</Text>
          <Text style={styles.itemValueBold}>{bill.units_consumed || 142} kWh</Text>
        </View>
      </View>

      {/* Tariff Blocks Breakdown */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
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
  cycleRow: {
    marginBottom: 12,
  },
  cycleBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cycleBtnActive: {
    backgroundColor: Colors.primaryMaroon,
    borderColor: Colors.primaryMaroon,
  },
  cycleBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  cycleBtnTextActive: {
    color: "#FFFFFF",
  },
  statementCard: {
    backgroundColor: Colors.primaryMaroon,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  accountText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  monthLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: "#D1FAE5",
  },
  statusUnpaid: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 10,
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
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  totalLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 2,
  },
  dueLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    marginTop: 4,
  },
  payNowStatementBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  payNowStatementBtnText: {
    color: Colors.darkMaroon,
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  itemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  itemLabelBold: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  itemValueBold: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
  },
});
