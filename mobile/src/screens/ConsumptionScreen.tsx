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
import { getConsumptionApi } from "../services/api";

interface ConsumptionProps {
  onNavigate: (screen: string) => void;
  token?: string;
  accountNumber?: string;
}

export const ConsumptionScreen: React.FC<ConsumptionProps> = ({ onNavigate, token, accountNumber = "0412345678" }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsumptionApi(token).then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, [token]);

  const maxKwh = Math.max(...records.map(r => r.units_kwh), 200);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consumption Trends</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Bar Chart Card */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>6-Month Electricity Consumption (kWh)</Text>
        <Text style={styles.chartSubtitle}>Domestic Block Efficiency Tracker</Text>

        <View style={styles.barsContainer}>
          {records.map((r, i) => {
            const barHeight = Math.max(20, (r.units_kwh / maxKwh) * 120);
            const isOct = r.month === "Oct";
            return (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>{r.units_kwh}</Text>
                <View
                  style={[
                    styles.barFill,
                    { height: barHeight },
                    isOct && styles.barFillOct
                  ]}
                />
                <Text style={[styles.barMonth, isOct && styles.barMonthOct]}>{r.month}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartFooter}>
          <Text style={styles.averageLabel}>Average: 154 kWh / month</Text>
          <Text style={styles.trendLabel}>October: -11.2% Reduction</Text>
        </View>
      </View>

      {/* Monthly Breakdown Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Historical Billing Statements</Text>
        {records.map((r, i) => (
          <View key={i} style={styles.tableRow}>
            <View>
              <Text style={styles.rowMonth}>{r.month} {r.year}</Text>
              <Text style={styles.rowUnits}>{r.units_kwh} units (kWh)</Text>
            </View>
            <Text style={styles.rowAmount}>
              Rs. {Number(r.amount_lkr).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
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
  chartCard: {
    backgroundColor: Colors.cardLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barFill: {
    width: 22,
    backgroundColor: Colors.primaryMaroon,
    borderRadius: 6,
  },
  barFillOct: {
    backgroundColor: Colors.gold,
  },
  barMonth: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },
  barMonthOct: {
    color: Colors.primaryMaroon,
    fontWeight: "bold",
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  averageLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  trendLabel: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "bold",
  },
  tableCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowMonth: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  rowUnits: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
  },
});
