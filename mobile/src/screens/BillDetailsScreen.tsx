import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Colors } from "../theme/colors";
import { getBillsApi } from "../services/api";

interface BillDetailsProps {
  onNavigate: (screen: string) => void;
  token?: string;
}

export const BillDetailsScreen: React.FC<BillDetailsProps> = ({ onNavigate, token }) => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillsApi(token).then((data) => {
      setBills(data);
      setLoading(false);
    });
  }, [token]);

  const bill = bills[0] || {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Itemized Electricity Bill</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bill Overview Card */}
      <View style={styles.statementCard}>
        <View style={styles.statementHeader}>
          <Text style={styles.monthLabel}>{bill.billing_month}</Text>
          <Text style={styles.dueLabel}>Due: {bill.due_date}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable Amount</Text>
          <Text style={styles.totalValue}>
            Rs. {Number(bill.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Meter Telemetry */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Meter Reading Telemetry</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Previous Reading (kWh)</Text>
          <Text style={styles.itemValue}>{bill.previous_reading}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Present Reading (kWh)</Text>
          <Text style={styles.itemValue}>{bill.present_reading}</Text>
        </View>
        <View style={[styles.itemRow, styles.itemRowHighlight]}>
          <Text style={styles.itemLabelBold}>Net Units Consumed</Text>
          <Text style={styles.itemValueBold}>{bill.units_consumed} kWh</Text>
        </View>
      </View>

      {/* Tariff Blocks Breakdown */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Tariff Charges Breakdown (D-1)</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Energy Charges (Blocks 1–5)</Text>
          <Text style={styles.itemValue}>Rs. {Number(bill.energy_charge).toFixed(2)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Monthly Fixed Service Charge</Text>
          <Text style={styles.itemValue}>Rs. {Number(bill.fixed_charge).toFixed(2)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Fuel Adjustment Levy (FAS)</Text>
          <Text style={styles.itemValue}>Rs. {Number(bill.fuel_adjustment).toFixed(2)}</Text>
        </View>
        <View style={[styles.itemRow, styles.itemRowHighlight]}>
          <Text style={styles.itemLabelBold}>Total Current Bill</Text>
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
  statementCard: {
    backgroundColor: Colors.primaryMaroon,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  dueLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  totalRow: {
    marginTop: 14,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  totalValue: {
    color: Colors.gold,
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 6,
    paddingTop: 8,
  },
  itemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  itemLabelBold: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  itemValueBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
  },
});
