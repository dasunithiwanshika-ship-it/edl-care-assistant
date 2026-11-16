import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";
import { Colors } from "../theme/colors";
import { getOutagesApi } from "../services/api";

interface OutageMapProps {
  onNavigate: (screen: string) => void;
}

export const OutageMapScreen: React.FC<OutageMapProps> = ({ onNavigate }) => {
  const [outages, setOutages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "planned" | "breakdown">("all");
  const [search, setSearch] = useState("");
  const [selectedOutage, setSelectedOutage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOutagesApi().then((data) => {
      setOutages(data);
      if (data.length > 0) setSelectedOutage(data[0]);
      setLoading(false);
    });
  }, []);

  const filtered = outages.filter((o) => {
    const matchesType = filter === "all" || o.outage_type === filter;
    const matchesSearch =
      o.area.toLowerCase().includes(search.toLowerCase()) ||
      o.district.toLowerCase().includes(search.toLowerCase()) ||
      o.feeder_name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("dashboard")}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grid Outage Monitor</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Simulated Map Visualizer */}
      <View style={styles.mapCanvas}>
        <View style={styles.mapOverlayTop}>
          <Text style={styles.mapLocationBadge}>🇱🇰 Sri Lanka Transmission Grid</Text>
        </View>

        {/* Stylized Island Pin Simulation */}
        <View style={styles.simulatedPinsArea}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.mapPin,
                item.outage_type === "breakdown" ? styles.pinBreakdown : styles.pinPlanned,
                selectedOutage?.id === item.id && styles.pinSelected
              ]}
              onPress={() => setSelectedOutage(item)}
            >
              <Text style={styles.mapPinText}>⚡</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Bottom Strip */}
        {selectedOutage && (
          <View style={styles.mapBottomStrip}>
            <Text style={styles.stripArea}>{selectedOutage.area}</Text>
            <Text style={styles.stripEta}>ETA: {selectedOutage.estimated_restoration}</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["all", "planned", "breakdown"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterTab, filter === t && styles.filterTabActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.filterTabText, filter === t && styles.filterTabTextActive]}>
              {t.toUpperCase()} ({outages.filter(o => t === "all" || o.outage_type === t).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Outage Incident List */}
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.incidentCard,
              selectedOutage?.id === item.id && styles.incidentCardActive
            ]}
            onPress={() => setSelectedOutage(item)}
          >
            <View style={styles.incidentRowTop}>
              <Text style={styles.incidentArea}>{item.area}</Text>
              <View
                style={[
                  styles.badgeType,
                  item.outage_type === "breakdown" ? styles.badgeBreakdown : styles.badgePlanned
                ]}
              >
                <Text
                  style={[
                    styles.badgeTypeText,
                    item.outage_type === "breakdown" ? styles.badgeTextBreakdown : styles.badgeTextPlanned
                  ]}
                >
                  {item.outage_type}
                </Text>
              </View>
            </View>

            <Text style={styles.feederText}>Feeder: {item.feeder_name}</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>

            <View style={styles.incidentFooter}>
              <Text style={styles.affectedText}>Affected: ~{item.affected_customers} premises</Text>
              <Text style={styles.etaText}>Restoration: {item.estimated_restoration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    backgroundColor: Colors.primaryMaroon,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  mapCanvas: {
    height: 180,
    backgroundColor: "#E2E8F0",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mapOverlayTop: {
    position: "absolute",
    top: 8,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mapLocationBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  simulatedPinsArea: {
    flexDirection: "row",
    gap: 32,
    alignItems: "center",
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  pinBreakdown: {
    backgroundColor: "#DC2626",
  },
  pinPlanned: {
    backgroundColor: "#D97706",
  },
  pinSelected: {
    transform: [{ scale: 1.25 }],
    borderColor: Colors.gold,
  },
  mapPinText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  mapBottomStrip: {
    position: "absolute",
    bottom: 8,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripArea: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  stripEta: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "bold",
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryMaroon,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  incidentCard: {
    backgroundColor: Colors.cardLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  incidentCardActive: {
    borderColor: Colors.primaryMaroon,
    backgroundColor: "#FFF5F6",
  },
  incidentRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incidentArea: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  badgeType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeBreakdown: {
    backgroundColor: "#FEE2E2",
  },
  badgePlanned: {
    backgroundColor: "#FEF3C7",
  },
  badgeTypeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  badgeTextBreakdown: {
    color: "#991B1B",
  },
  badgeTextPlanned: {
    color: "#92400E",
  },
  feederText: {
    fontSize: 12,
    color: Colors.primaryMaroon,
    fontWeight: "600",
    marginTop: 4,
  },
  reasonText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  affectedText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  etaText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.success,
  },
});
