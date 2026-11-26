import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { getConsumptionApi } from "../services/api";

interface ConsumptionProps {
  onNavigate: (screen: string) => void;
  token?: string;
  accountNumber?: string;
}

export const ConsumptionScreen: React.FC<ConsumptionProps> = ({
  onNavigate,
  token,
  accountNumber = "0412345678"
}) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsumptionApi(token)
      .then((data) => {
        if (Array.isArray(data)) setRecords(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token]);

  const maxKwh = Math.max(...records.map((r) => r.units_kwh), 200);

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
          <Text style={styles.heroSubtitle}>ACCOUNT #{accountNumber} • 6-MONTH TELEMETRY</Text>
          <Text style={styles.heroTitle}>Consumption Trends</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Main Bar Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Monthly Electricity Consumption</Text>
              <Text style={styles.chartSubtitle}>Domestic Block Efficiency Tracker (kWh)</Text>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-down" size={12} color="#10B981" style={{ marginRight: 3 }} />
              <Text style={styles.trendGreen}>-11.2%</Text>
            </View>
          </View>

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
            <Text style={styles.averageLabel}>6-Month Average: 154 kWh / month</Text>
            <Text style={styles.trendLabel}>October: 142 kWh (-11.2%)</Text>
          </View>
        </View>

        {/* Monthly Breakdown Table Card */}
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
  chartCard: {
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
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
  },
  chartSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendGreen: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#10B981",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
    paddingBottom: 4,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748B",
    marginBottom: 4,
  },
  barFill: {
    width: 22,
    backgroundColor: "#650B24",
    borderRadius: 6,
  },
  barFillOct: {
    backgroundColor: "#D97706",
  },
  barMonth: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    fontWeight: "600",
  },
  barMonthOct: {
    color: "#650B24",
    fontWeight: "bold",
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 8,
  },
  averageLabel: {
    fontSize: 11.5,
    color: "#64748B",
  },
  trendLabel: {
    fontSize: 11.5,
    color: "#10B981",
    fontWeight: "bold",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  rowMonth: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E293B",
  },
  rowUnits: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#650B24",
  },
});
