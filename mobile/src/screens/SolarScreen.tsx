import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { Colors } from "../theme/colors";
import { getSolarCapacityApi } from "../services/api";

interface SolarScreenProps {
  onNavigate: (screen: string) => void;
}

export const SolarScreen: React.FC<SolarScreenProps> = ({ onNavigate }) => {
  const [code, setCode] = useState("TR-402");
  const [capacity, setCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    getSolarCapacityApi(code).then((data) => {
      setCapacity(data);
      setLoading(false);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solar Feeder Capacity</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Rooftop Solar PV Grid Feasibility</Text>
        <Text style={styles.infoDesc}>
          Enter your local distribution transformer code to check remaining absorption capacity for Net-Metering or Net-Plus applications.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchCard}>
        <Text style={styles.label}>Distribution Transformer Code</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="e.g. TR-402, TR-105, TR-780"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.checkBtn} onPress={handleSearch}>
            <Text style={styles.checkBtnText}>Check</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Transformer Pills */}
        <View style={styles.pillsRow}>
          {["TR-402", "TR-105", "TR-780", "TR-312"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.pill, code === p && styles.pillActive]}
              onPress={() => {
                setCode(p);
                getSolarCapacityApi(p).then(setCapacity);
              }}
            >
              <Text style={[styles.pillText, code === p && styles.pillTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color={Colors.primaryMaroon} style={{ marginTop: 20 }} />}

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

          {capacity.is_available ? (
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => Alert.alert("Application Notice", "Simulated Net-Metering Application initiated.")}
            >
              <Text style={styles.applyBtnText}>Apply for Net-Metering Interconnection</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.waitlistNote}>
              ⚠️ Transformer quota exceeded. Applications are placed on the network augmentation waitlist.
            </Text>
          )}
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
  infoCard: {
    backgroundColor: Colors.cardLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  infoDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  searchCard: {
    backgroundColor: Colors.cardLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  checkBtn: {
    backgroundColor: Colors.primaryMaroon,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  checkBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  pill: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.primaryMaroon,
  },
  pillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "bold",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  resultCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultCode: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  statBox: {
    backgroundColor: Colors.backgroundLight,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primaryMaroon,
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  applyBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  applyBtnText: {
    color: Colors.darkMaroon,
    fontWeight: "bold",
    fontSize: 13,
  },
  waitlistNote: {
    fontSize: 11,
    color: "#991B1B",
    marginTop: 10,
    textAlign: "center",
  },
});
