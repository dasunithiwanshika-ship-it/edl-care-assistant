"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OutageRecord } from "@/types";

interface LeafletMapProps {
  outages: OutageRecord[];
  selectedOutage: OutageRecord | null;
  onSelectOutage: (outage: OutageRecord) => void;
  mapLayer: "standard" | "grid" | "satellite";
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  outages,
  selectedOutage,
  onSelectOutage,
  mapLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Sri Lanka
    const map = L.map(mapContainerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 8,
      zoomControl: false,
    });

    // Default OpenStreetMap TileLayer
    const tileUrl =
      mapLayer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution =
      mapLayer === "satellite"
        ? "Tiles © Esri & contributors"
        : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | EDL Grid Monitor';

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapLayer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution =
      mapLayer === "satellite"
        ? "Tiles © Esri & contributors"
        : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | EDL Grid Monitor';

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);
  }, [mapLayer]);

  // Update Outage Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    outages.forEach((outage) => {
      const isBreakdown = outage.type === "breakdown";
      const markerColor = isBreakdown ? "#9E1B34" : "#D97706";
      const pulseColor = isBreakdown ? "rgba(158, 27, 52, 0.4)" : "rgba(217, 119, 6, 0.4)";

      const customIcon = L.divIcon({
        className: "custom-outage-marker",
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-color: ${pulseColor};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: bold;
              font-size: 11px;
            ">
              ⚡
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([outage.coordinates.lat, outage.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: #1a1d20; font-size: 13px;">${outage.area}</strong>
            <span style="
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 4px;
              background-color: ${isBreakdown ? "#fee2e2" : "#fef3c7"};
              color: ${isBreakdown ? "#991b1b" : "#92400e"};
            ">${outage.type}</span>
          </div>
          <div style="font-size: 11px; color: #4b5563; margin-bottom: 4px;">
            <strong>Feeder:</strong> ${outage.feederName}
          </div>
          <div style="font-size: 11px; color: #4b5563; margin-bottom: 4px;">
            <strong>Restoration:</strong> ${outage.estimatedRestoration}
          </div>
          <div style="font-size: 11px; color: #4b5563; margin-bottom: 6px;">
            <strong>Affected:</strong> ~${outage.affectedCustomers} premises
          </div>
          <p style="font-size: 10px; color: #6b7280; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 4px;">
            ${outage.reason}
          </p>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectOutage(outage);
      });

      markersRef.current[outage.id] = marker;
    });
  }, [outages, onSelectOutage]);

  // Pan to selected outage
  useEffect(() => {
    if (!selectedOutage || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedOutage.coordinates.lat, selectedOutage.coordinates.lng],
      12,
      { duration: 1.2 }
    );
    const marker = markersRef.current[selectedOutage.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedOutage]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};
