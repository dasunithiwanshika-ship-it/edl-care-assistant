import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    getOutagesApi()
      .then((data) => {
        if (Array.isArray(data)) {
          setOutages(data);
          if (data.length > 0) setSelectedOutage(data[0]);
        }
        setLoading(false);
      })
      .catch(() => {
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
          <Text style={styles.heroSubtitle}>LIVE TRANSMISSION & FEEDER MONITOR</Text>
          <Text style={styles.heroTitle}>Grid Outages</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Simulated Map Visualizer Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapOverlayTop}>
            <Ionicons name="pulse" size={12} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.mapLocationBadge}>Sri Lanka National Transmission Grid</Text>
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
                <Ionicons name="flash" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Bottom Strip */}
          {selectedOutage && (
            <View style={styles.mapBottomStrip}>
              <View>
                <Text style={styles.stripArea}>{selectedOutage.area}</Text>
                <Text style={styles.stripFeeder}>Feeder: {selectedOutage.feeder_name}</Text>
              </View>
              <Text style={styles.stripEta}>ETA: {selectedOutage.estimated_restoration}</Text>
            </View>
          )}
        </View>

        {/* Filter Capsule Chips */}
        <View style={styles.filterRow}>
          {(["all", "planned", "breakdown"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterTab, filter === t && styles.filterTabActive]}
              activeOpacity={0.7}
              onPress={() => setFilter(t)}
            >
              <Text style={[styles.filterTabText, filter === t && styles.filterTabTextActive]}>
                {t.toUpperCase()} ({outages.filter((o) => t === "all" || o.outage_type === t).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Outage Incident List */}
        {filtered.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="flash-outline" size={36} color="#9CA3AF" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyTitle}>No Outages Reported</Text>
            <Text style={styles.emptyDesc}>
              No power breakdowns or scheduled maintenance match your selected filter.
            </Text>
          </View>
        )}

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.incidentCard,
              selectedOutage?.id === item.id && styles.incidentCardActive
            ]}
            activeOpacity={0.8}
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
    backgroundColor: "#F4F4F7",
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mapCard: {
    height: 190,
    backgroundColor: "#E2E8F0",
    borderRadius: 22,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mapOverlayTop: {
    position: "absolute",
    top: 10,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  mapLocationBadge: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#1E293B",
  },
  simulatedPinsArea: {
    flexDirection: "row",
    gap: 32,
    alignItems: "center",
  },
  mapPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pinBreakdown: {
    backgroundColor: "#DC2626",
  },
  pinPlanned: {
    backgroundColor: "#D97706",
  },
  pinSelected: {
    transform: [{ scale: 1.25 }],
    borderColor: "#F5C518",
  },
  mapBottomStrip: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripArea: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
  },
  stripFeeder: {
    fontSize: 10.5,
    color: "#64748B",
  },
  stripEta: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "bold",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: "#650B24",
    borderColor: "#650B24",
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  emptyDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  incidentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  incidentCardActive: {
    borderColor: "#650B24",
    borderWidth: 1.5,
  },
  incidentRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  incidentArea: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  badgeType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
    color: "#B45309",
  },
  feederText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#650B24",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 10,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  affectedText: {
    fontSize: 11,
    color: "#64748B",
  },
  etaText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
});
