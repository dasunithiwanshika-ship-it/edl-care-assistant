import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { getSolarCapacityApi, getSolarTransformersApi } from "../services/api";

interface SolarScreenProps {
  onNavigate: (screen: string) => void;
  accountNumber?: string;
}

export const SolarScreen: React.FC<SolarScreenProps> = ({ onNavigate, accountNumber = "0412345678" }) => {
  const [code, setCode] = useState("TR-402");
  const [capacity, setCapacity] = useState<any>(null);
  const [transformers, setTransformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSolarTransformersApi()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setTransformers(list);
        }
      })
      .catch(() => {});

    setLoading(true);
    getSolarCapacityApi(code, accountNumber)
      .then((data) => {
        setCapacity(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    setLoading(true);
    getSolarCapacityApi(code, accountNumber)
      .then((data) => {
        setCapacity(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert("Solar Query Failed", err.message || "Failed to check transformer capacity.");
      });
  };

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
          <Text style={styles.heroSubtitle}>TRANSFORMER CAPACITY & NET-METERING</Text>
          <Text style={styles.heroTitle}>Solar Feeder Capacity</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="sunny" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Rooftop Solar PV Grid Feasibility</Text>
            <Text style={styles.infoDesc}>
              Enter your local distribution transformer code to check absorption capacity for Net-Metering or Net-Plus applications.
            </Text>
          </View>
        </View>

        {/* Search Input Card */}
        <View style={styles.searchCard}>
          <Text style={styles.label}>Distribution Transformer Code</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="e.g. TR-402, TR-105, TR-780"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.checkBtn} activeOpacity={0.85} onPress={handleSearch}>
              <Text style={styles.checkBtnText}>Check</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Transformer Pills */}
          <Text style={styles.pillsLabel}>Sample Local Transformers:</Text>
          <View style={styles.pillsRow}>
            {["TR-402", "TR-105", "TR-780", "TR-312"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pill, code === p && styles.pillActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setCode(p);
                  getSolarCapacityApi(p, accountNumber).then(setCapacity);
                }}
              >
                <Text style={[styles.pillText, code === p && styles.pillTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading && <ActivityIndicator size="large" color="#650B24" style={{ marginVertical: 20 }} />}

        {/* Capacity Results */}
        {capacity && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCode}>Transformer {capacity.transformer_code}</Text>
              <View style={[styles.statusBadge, capacity.is_available ? styles.statusAvail : styles.statusExceed]}>
                <Text style={[styles.statusBadgeText, capacity.is_available ? styles.statusAvailText : styles.statusExceedText]}>
                  {capacity.status}
                </Text>
              </View>
            </View>

            <Text style={styles.resultArea}>{capacity.area} ({capacity.feeder_name})</Text>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Remaining Solar Absorption Capacity</Text>
              <Text style={styles.statValue}>{capacity.remaining_capacity_kw} kW</Text>
              <Text style={styles.statSub}>
                Used: {capacity.used_capacity_kva} kVA of {capacity.total_capacity_kva} kVA (Max Threshold: {capacity.max_threshold_pct}%)
              </Text>
            </View>

            {capacity.application_allowed ? (
              <View style={styles.bannerApproved}>
                <Ionicons name="checkmark-circle" size={16} color="#065F46" style={{ marginRight: 6 }} />
                <Text style={styles.bannerApprovedText}>
                  Rooftop Solar Interconnection Feasible • Direct Application Permitted
                </Text>
              </View>
            ) : (
              <View style={styles.bannerExceeded}>
                <Ionicons name="alert-circle" size={16} color="#991B1B" style={{ marginRight: 6 }} />
                <Text style={styles.bannerExceededText}>
                  Feeder Quota Exceeded • Transformer Upgrade or Energy Storage Required
                </Text>
              </View>
            )}
          </View>
        )}
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#D97706",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  searchCard: {
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
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: "#F4F4F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  checkBtn: {
    backgroundColor: "#650B24",
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  checkBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  pillsLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "500",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: "#F4F4F7",
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  pillActive: {
    backgroundColor: "#650B24",
    borderColor: "#650B24",
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  resultCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusAvail: {
    backgroundColor: "#D1FAE5",
  },
  statusExceed: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusAvailText: {
    color: "#065F46",
  },
  statusExceedText: {
    color: "#991B1B",
  },
  resultArea: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: "#F4F4F7",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  statLabel: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#650B24",
  },
  statSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  bannerApproved: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 10,
    borderRadius: 12,
  },
  bannerApprovedText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "600",
    flex: 1,
  },
  bannerExceeded: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 12,
  },
  bannerExceededText: {
    fontSize: 11,
    color: "#991B1B",
    fontWeight: "600",
    flex: 1,
  },
});
